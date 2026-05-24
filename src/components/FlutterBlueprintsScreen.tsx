import React, { useState } from 'react';
import { Menu, FileCode, Check, Copy, Layers, Cpu, ShieldAlert, ArrowDownToLine, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FlutterBlueprintsScreenProps {
  onOpenDrawer: () => void;
}

export const FlutterBlueprintsScreen: React.FC<FlutterBlueprintsScreenProps> = ({ onOpenDrawer }) => {
  const [selectedFile, setSelectedFile] = useState<string>('pubspec.yaml');
  const [copiedStatus, setCopiedStatus] = useState<boolean>(false);
  const [designStyle, setDesignStyle] = useState<'material' | 'cupertino'>('material');

  // Multi-file companion Flutter Dart codebases written by Brian McCarthy
  const flutterSourceFiles: Record<string, { desc: string; syntax: string; code: string }> = {
    'pubspec.yaml': {
      desc: 'Project configuration and dependencies declaration',
      syntax: 'yaml',
      code: `name: chronos_sync_app
description: High-density companion Time Tracking App for Android & iOS.
version: 1.1.2+3

environment:
  sdk: ">=3.2.0 <4.0.0"

dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.8
  provider: ^6.1.2
  shared_preferences: ^2.2.2
  intl: ^0.19.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
`
    },
    'time_entry_provider.dart': {
      desc: 'State manager implementing empty initialization list and full SharedPreferences persistence for Projects, Tasks and TimeEntries',
      syntax: 'dart',
      code: `// Written by Brian McCarthy
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class Project {
  final String id;
  final String name;

  Project({required this.id, required this.name});

  Map<String, dynamic> toJson() => {'id': id, 'name': name};
  factory Project.fromJson(Map<String, dynamic> json) => Project(id: json['id'], name: json['name']);
}

class Task {
  final String id;
  final String name;

  Task({required this.id, required this.name});

  Map<String, dynamic> toJson() => {'id': id, 'name': name};
  factory Task.fromJson(Map<String, dynamic> json) => Task(id: json['id'], name: json['name']);
}

class TimeEntry {
  final String id;
  final String projectId;
  final String taskId;
  final double totalTime;
  final String date;
  final String notes;

  TimeEntry({
    required this.id,
    required this.projectId,
    required this.taskId,
    required this.totalTime,
    required this.date,
    required this.notes,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'projectId': projectId,
    'taskId': taskId,
    'totalTime': totalTime,
    'date': date,
    'notes': notes,
  };

  factory TimeEntry.fromJson(Map<String, dynamic> json) => TimeEntry(
    id: json['id'],
    projectId: json['projectId'],
    taskId: json['taskId'],
    totalTime: json['totalTime'].toDouble(),
    date: json['date'],
    notes: json['notes'] ?? '',
  );
}

class TimeEntryProvider extends ChangeNotifier {
  // 5: Initialized as empty lists
  List<Project> _projects = [];
  List<Task> _tasks = [];
  List<TimeEntry> _entries = [];

  List<Project> get projects => _projects;
  List<Task> get tasks => _tasks;
  List<TimeEntry> get entries => _entries;

  TimeEntryProvider() {
    loadLocalData();
  }

  // 5: Data persistence using SharedPreferences for loading
  Future<void> loadLocalData() async {
    final prefs = await SharedPreferences.getInstance();
    
    final projectsJson = prefs.getString('projects_db');
    if (projectsJson != null) {
      final List decoded = jsonDecode(projectsJson);
      _projects = decoded.map((item) => Project.fromJson(item)).toList();
    } else {
      // Seed default projects if none present
      _projects = [
        Project(id: 'p1', name: 'Internal R&D'),
        Project(id: 'p2', name: 'Mobile App Setup'),
      ];
    }

    final tasksJson = prefs.getString('tasks_db');
    if (tasksJson != null) {
      final List decoded = jsonDecode(tasksJson);
      _tasks = decoded.map((item) => Task.fromJson(item)).toList();
    } else {
      // Seed default tasks if none present
      _tasks = [
        Task(id: 't1', name: 'UI & Layout Designing'),
        Task(id: 't2', name: 'State Coding & API'),
      ];
    }

    final entriesJson = prefs.getString('time_entries_db');
    if (entriesJson != null) {
      final List decoded = jsonDecode(entriesJson);
      _entries = decoded.map((item) => TimeEntry.fromJson(item)).toList();
    } else {
      _entries = []; // Defaults to an empty list
    }
    notifyListeners();
  }

  // 5: Data persistence using SharedPreferences for saving
  Future<void> saveLocalData() async {
    final prefs = await SharedPreferences.getInstance();
    
    final String projectsEncoded = jsonEncode(_projects.map((p) => p.toJson()).toList());
    await prefs.setString('projects_db', projectsEncoded);

    final String tasksEncoded = jsonEncode(_tasks.map((t) => t.toJson()).toList());
    await prefs.setString('tasks_db', tasksEncoded);

    final String entriesEncoded = jsonEncode(_entries.map((e) => e.toJson()).toList());
    await prefs.setString('time_entries_db', entriesEncoded);
  }

  // Project utilities
  void addProject(Project project) {
    _projects.add(project);
    saveLocalData();
    notifyListeners();
  }

  void deleteProject(String id) {
    _projects.removeWhere((p) => p.id == id);
    _entries.removeWhere((e) => e.projectId == id); // Cascade delete logs
    saveLocalData();
    notifyListeners();
  }

  // Task utilities
  void addTask(Task task) {
    _tasks.add(task);
    saveLocalData();
    notifyListeners();
  }

  void deleteTask(String id) {
    _tasks.removeWhere((t) => t.id == id);
    _entries.removeWhere((e) => e.taskId == id); // Cascade delete logs
    saveLocalData();
    notifyListeners();
  }

  // TimeEntry utilities
  void addTimeEntry(TimeEntry entry) {
    _entries.add(entry);
    saveLocalData();
    notifyListeners();
  }

  void deleteTimeEntry(String id) {
    _entries.removeWhere((element) => element.id == id);
    saveLocalData();
    notifyListeners();
  }

  String getProjectName(String projectId) {
    return _projects.firstWhere((p) => p.id == projectId, orElse: () => Project(id: '', name: 'Unknown Project')).name;
  }

  String getTaskName(String taskId) {
    return _tasks.firstWhere((t) => t.id == taskId, orElse: () => Task(id: '', name: 'Unknown Task')).name;
  }
}
`
    },
    'home_screen.dart': {
      desc: 'All Entries & Grouped Tabs, Empty-state panels, dynamic list tiles, swipe delete and Drawer Navigation',
      syntax: 'dart',
      code: `// Written by Brian McCarthy
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/time_entry_provider.dart';
import 'add_time_entry_screen.dart';
import 'project_management_screen.dart';
import 'task_management_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<TimeEntryProvider>(context);

    // Helpers to calculate grouped lists
    final groupedEntries = <String, List<TimeEntry>>{};
    for (var entry in provider.entries) {
      groupedEntries.putIfAbsent(entry.projectId, () => []).add(entry);
    }

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        backgroundColor: const Color(0xFFF1F5F9),
        appBar: AppBar(
          title: const Text('ChronosSync Time Tracker', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          backgroundColor: Colors.white,
          foregroundColor: const Color(0xFF0F172A),
          elevation: 0.5,
          bottom: const TabBar(
            labelColor: Color(0xFF4F46E5),
            unselectedLabelColor: Color(0xFF64748B),
            indicatorColor: Color(0xFF4F46E5),
            tabs: [
              Tab(text: 'All Entries'),
              Tab(text: 'Grouped by Projects'),
            ],
          ),
        ),
        // 1: Hamburger menu drawer with high fidelity items mapping correct routes
        drawer: Drawer(
          child: Column(
            children: [
              DrawerHeader(
                decoration: const BoxDecoration(color: Color(0xFF0F172A)),
                child: SizedBox(
                  width: double.infinity,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const CircleAvatar(
                        backgroundColor: Color(0xFF4F46E5),
                        child: Text('C', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      ),
                      const SizedBox(height: 12),
                      const Text(
                        'ChronosSync Mobile',
                        style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Written by Brian McCarthy',
                        style: TextStyle(color: Colors.indigo.shade200, fontSize: 10, fontWeight: FontWeight.bold),
                      )
                    ],
                  ),
                ),
              ),
              ListTile(
                leading: const Icon(Icons.timer, color: Color(0xFF4F46E5)),
                title: const Text('Time Entries', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                onTap: () {
                  Navigator.pop(context);
                },
              ),
              // 1: Navigate to Projects Management Screen
              ListTile(
                leading: const Icon(Icons.folder_open, color: Color(0xFF4F46E5)),
                title: const Text('Projects', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                onTap: () {
                  Navigator.pop(context); // Close Drawer
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const ProjectManagementScreen()),
                  );
                },
              ),
              // 1: Navigate to Tasks Management Screen
              ListTile(
                leading: const Icon(Icons.assignment_turned_in, color: Color(0xFF4F46E5)),
                title: const Text('Tasks', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                onTap: () {
                  Navigator.pop(context); // Close Drawer
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const TaskManagementScreen()),
                  );
                },
              ),
              const Divider(),
              const Spacer(),
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Text(
                  'Written by Brian McCarthy',
                  style: TextStyle(fontSize: 10, color: Colors.grey.shade500, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            // TAB 1: ALL ENTRIES
            provider.entries.isEmpty
                // 1: Active display for Empty State UI in All Entries Tab
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24.0),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.timer_outlined, size: 64, color: Colors.slate.shade300),
                          const SizedBox(height: 16),
                          const Text('No entries found', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
                          const SizedBox(height: 6),
                          Text(
                            'Log decimal hours of work using the (+) button below.\\nWritten by Brian McCarthy.',
                            textAlign: TextAlign.center,
                            style: TextStyle(fontSize: 12, color: Colors.slate.shade400, fontWeight: FontWeight.medium),
                          ),
                        ],
                      ),
                    ),
                  )
                // 1: Scrollable List of All Logged Time Entries
                : ListView.builder(
                    padding: const EdgeInsets.all(12),
                    itemCount: provider.entries.length,
                    itemBuilder: (context, index) {
                      final item = provider.entries[index];
                      return Card(
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        elevation: 0,
                        margin: const EdgeInsets.only(bottom: 8),
                        child: Padding(
                          padding: const EdgeInsets.all(12.0),
                          child: Row(
                            children: [
                              Container(
                                width: 5,
                                height: 50,
                                decoration: BoxDecoration(
                                  color: const Color(0xFF4F46E5),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      provider.getProjectName(item.projectId),
                                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F172A)),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      provider.getTaskName(item.taskId),
                                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.slate.shade500),
                                    ),
                                    if (item.notes.isNotEmpty) ...[
                                      const SizedBox(height: 4),
                                      Text(
                                        item.notes,
                                        style: TextStyle(fontSize: 11, fontStyle: FontStyle.italic, color: Colors.slate.shade400),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      )
                                    ],
                                  ],
                                ),
                              ),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, py: 4),
                                    decoration: BoxDecoration(
                                      color: Colors.indigo.shade50,
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      '\${item.totalTime.toStringAsFixed(1)}h',
                                      style: const TextStyle(color: Color(0xFF4F46E5), fontWeight: FontWeight.bold, fontSize: 12),
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    item.date,
                                    style: TextStyle(fontSize: 10, color: Colors.slate.shade400, fontWeight: FontWeight.bold),
                                  ),
                                ],
                              ),
                              const SizedBox(width: 4),
                              // 1: Delete entry action
                              IconButton(
                                icon: const Icon(Icons.delete_outline, color: Colors.redAccent, size: 20),
                                onPressed: () {
                                  // Trigger deletion on provider
                                  provider.deleteTimeEntry(item.id);
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(content: Text('Time Entry deleted successfully.')),
                                  );
                                },
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),

            // TAB 2: GROUPED BY PROJECTS
            groupedEntries.isEmpty
                // 1: Active display for Empty State UI in Grouped by Projects Tab
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24.0),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.folder_outlined, size: 64, color: Colors.slate.shade300),
                          const SizedBox(height: 16),
                          const Text('No grouped projects logged', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
                          const SizedBox(height: 6),
                          Text(
                            'Logged workloads will automatically categorize themselves here.\\nWritten by Brian McCarthy.',
                            textAlign: TextAlign.center,
                            style: TextStyle(fontSize: 12, color: Colors.slate.shade400, fontWeight: FontWeight.medium),
                          ),
                        ],
                      ),
                    ),
                  )
                // 1: Tree diagram grouping list of details automatically
                : ListView.builder(
                    padding: const EdgeInsets.all(12),
                    itemCount: groupedEntries.length,
                    itemBuilder: (context, index) {
                      final pId = groupedEntries.keys.elementAt(index);
                      final list = groupedEntries[pId]!;
                      final double sum = list.fold(0.0, (previous, element) => previous + element.totalTime);

                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        elevation: 0,
                        child: ExpansionTile(
                          shape: const RoundedBorder(),
                          title: Text(
                            provider.getProjectName(pId),
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F172A)),
                          ),
                          subtitle: Text(
                            '\${list.length} log\${list.length == 1 ? "" : "s"} total',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.slate.shade400),
                          ),
                          trailing: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, py: 5),
                            decoration: BoxDecoration(color: const Color(0xFF0F172A), borderRadius: BorderRadius.circular(8)),
                            child: Text(
                              '\${sum.toStringAsFixed(1)} hrs',
                              style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 11),
                            ),
                          ),
                          children: list.map((e) {
                            return ListTile(
                              dense: true,
                              title: Text(provider.getTaskName(e.taskId), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                              subtitle: Text(e.date, style: const TextStyle(fontSize: 10)),
                              trailing: Text('\${e.totalTime}h', style: TextStyle(color: Colors.grey.shade600, fontWeight: FontWeight.bold)),
                            );
                          }).toList(),
                        ),
                      );
                    },
                  ),
          ],
        ),
        // Trigger Add New Entry controller and views
        floatingActionButton: FloatingActionButton(
          backgroundColor: const Color(0xFF4F46E5),
          child: const Icon(Icons.add, color: Colors.white),
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const AddTimeEntryScreen()),
            );
          },
        ),
      ),
    );
  }
}
`
    },
    'add_time_entry_screen.dart': {
      desc: 'Form with Project and Task dropdowns mapped, validations and state save triggers',
      syntax: 'dart',
      code: `// Written by Brian McCarthy
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/time_entry_provider.dart';

class AddTimeEntryScreen extends StatefulWidget {
  const AddTimeEntryScreen({super.key});

  @override
  State<AddTimeEntryScreen> createState() => _AddTimeEntryScreenState();
}

class _AddTimeEntryScreenState extends State<AddTimeEntryScreen> {
  final _formKey = GlobalKey<FormState>();
  String? _selectedProjectId;
  String? _selectedTaskId;
  final TextEditingController _timeController = TextEditingController();
  final TextEditingController _notesController = TextEditingController();
  String _selectedDate = DateTime.now().toIso8601String().split('T')[0];

  @override
  Widget build(BuildContext context) {
    // 2: Access data models securely from provider and inject dropdown streams
    final provider = Provider.of<TimeEntryProvider>(context);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Add Time Entry', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF0F172A),
        elevation: 0.5,
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  'ChronosSync Data Logger\\nWritten by Brian McCarthy',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Color(0xFF4F46E5)),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                Card(
                  elevation: 0,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // 2: Project dropdown populated cleanly from Provider data
                        const Text('Project', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF1E293B))),
                        const SizedBox(height: 6),
                        DropdownButtonFormField<String>(
                          value: _selectedProjectId,
                          hint: const Text('Select a project'),
                          decoration: InputDecoration(
                            fillColor: const Color(0xFFFAFBFD),
                            filled: true,
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                          ),
                          items: provider.projects.map((proj) {
                            return DropdownMenuItem<String>(
                              value: proj.id,
                              child: Text(proj.name),
                            );
                          }).toList(),
                          validator: (val) => val == null ? 'Please select a workspace project' : null,
                          onChanged: (val) {
                            setState(() {
                              _selectedProjectId = val;
                            });
                          },
                        ),
                        const SizedBox(height: 16),

                        // 2: Task dropdown populated cleanly from Provider data
                        const Text('Task Scope', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF1E293B))),
                        const SizedBox(height: 6),
                        DropdownButtonFormField<String>(
                          value: _selectedTaskId,
                          hint: const Text('Select a task'),
                          decoration: InputDecoration(
                            fillColor: const Color(0xFFFAFBFD),
                            filled: true,
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                          ),
                          items: provider.tasks.map((tsk) {
                            return DropdownMenuItem<String>(
                              value: tsk.id,
                              child: Text(tsk.name),
                            );
                          }).toList(),
                          validator: (val) => val == null ? 'Please select a task workflow' : null,
                          onChanged: (val) {
                            setState(() {
                              _selectedTaskId = val;
                            });
                          },
                        ),
                        const SizedBox(height: 16),

                        // Time log Duration text input controller
                        const Text('Logged Duration (Hours)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF1E293B))),
                        const SizedBox(height: 6),
                        TextFormField(
                          controller: _timeController,
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                          decoration: InputDecoration(
                            hintText: 'e.g. 2.5',
                            fillColor: const Color(0xFFFAFBFD),
                            filled: true,
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                          ),
                          validator: (val) {
                            if (val == null || val.isEmpty) return 'Duration is required';
                            final d = double.tryParse(val);
                            if (d == null || d <= 0) return 'Please enter a valid positive decimal quantity';
                            return null;
                          },
                        ),
                        const SizedBox(height: 16),

                        // Work Logs Notes Inputs
                        const Text('Work notes', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF1E293B))),
                        const SizedBox(height: 6),
                        TextFormField(
                          controller: _notesController,
                          maxLines: 2,
                          decoration: InputDecoration(
                            hintText: 'Enter log details optional',
                            fillColor: const Color(0xFFFAFBFD),
                            filled: true,
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                          ),
                        ),
                        const SizedBox(height: 16),

                        // In-app date limits selection field
                        const Text('Logged Date', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF1E293B))),
                        const SizedBox(height: 6),
                        InkWell(
                          onTap: () async {
                            final pickedDate = await showDatePicker(
                              context: context,
                              initialDate: DateTime.now(),
                              firstDate: DateTime(2025),
                              lastDate: DateTime(2027),
                            );
                            if (pickedDate != null) {
                              setState(() {
                                _selectedDate = pickedDate.toIso8601String().split('T')[0];
                              });
                            }
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFAFBFD),
                              border: Border.all(color: Colors.grey.shade400),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.between,
                              children: [
                                Text(_selectedDate),
                                const Icon(Icons.calendar_month, size: 18, color: Color(0xFF4F46E5)),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 20),

                // 2: Form submission controller with save and validator pop callbacks
                ElevatedButton(
                  onPressed: () {
                    if (_formKey.currentState!.validate()) {
                      final generatedId = 'log_' + DateTime.now().millisecondsSinceEpoch.toString();
                      final typedDouble = double.parse(_timeController.text.trim());

                      final newLog = TimeEntry(
                        id: generatedId,
                        projectId: _selectedProjectId!,
                        taskId: _selectedTaskId!,
                        totalTime: typedDouble,
                        date: _selectedDate,
                        notes: _notesController.text.trim(),
                      );

                      // Save to SharedPreferences through provider
                      provider.addTimeEntry(newLog);

                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Time Entry saved successfully.')),
                      );

                      Navigator.pop(context); // Close the entry form
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF4F46E5),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  child: const Text('Save Entry', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
`
    },
    'project_management_screen.dart': {
      desc: 'Screen monitoring project scopes, including scrollable lists, delete, and add new dialog using the (+) button',
      syntax: 'dart',
      code: `// Written by Brian McCarthy
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/time_entry_provider.dart';

class ProjectManagementScreen extends StatelessWidget {
  const ProjectManagementScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<TimeEntryProvider>(context);

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      appBar: AppBar(
        title: const Text('Manage Workspace Projects', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF0F172A),
        elevation: 0.5,
      ),
      body: Column(
        children: [
          const SizedBox(height: 8),
          const Text(
            'Written by Brian McCarthy',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF4F46E5)),
          ),
          const SizedBox(height: 8),
          // 3: List view tracking projects with cascading deletion logic built in
          Expanded(
            child: provider.projects.isEmpty
                ? Center(
                    child: Text(
                      'No projects registered yet.\\nClick the (+) button to create one.',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.slate.shade400, fontWeight: FontWeight.medium, fontSize: 12),
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(12),
                    itemCount: provider.projects.length,
                    itemBuilder: (context, index) {
                      final proj = provider.projects[index];
                      return Card(
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        elevation: 0,
                        margin: const EdgeInsets.only(bottom: 8),
                        child: ListTile(
                          leading: const CircleAvatar(
                            backgroundColor: Color(0xFFEEF2FF),
                            child: Icon(Icons.folder_open, color: Color(0xFF4F46E5), size: 18),
                          ),
                          title: Text(
                            proj.name,
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F172A)),
                          ),
                          // 3: Immediate delete key binding inside item column
                          trailing: IconButton(
                            icon: const Icon(Icons.delete_outline, color: Colors.redAccent, size: 20),
                            onPressed: () {
                              provider.deleteProject(proj.id);
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Project deleted successfully.')),
                              );
                            },
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
      // 3: Floating Action Button (+) implementing immediate Material Modal Add Dialog triggers
      floatingActionButton: FloatingActionButton(
        backgroundColor: const Color(0xFF4F46E5),
        child: const Icon(Icons.add, color: Colors.white),
        // 3: Trigger Show dialog using the (+) FAB action
        onPressed: () {
          final textController = TextEditingController();

          showDialog(
            context: context,
            builder: (ctx) {
              return AlertDialog(
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                title: const Text('Add Workspace Project', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                content: TextField(
                  controller: textController,
                  autofocus: true,
                  decoration: const InputDecoration(
                    labelText: 'Project Name',
                    hintText: 'e.g., Client Syncing',
                  ),
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pop(ctx),
                    child: const Text('Cancel', style: TextStyle(color: Color(0xFF64748B))),
                  ),
                  ElevatedButton(
                    onPressed: () {
                      final enteredName = textController.text.trim();
                      if (enteredName.isNotEmpty) {
                        final newProj = Project(
                          id: 'proj_' + DateTime.now().millisecondsSinceEpoch.toString(),
                          name: enteredName,
                        );
                        provider.addProject(newProj);
                        Navigator.pop(ctx);
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('New project created!')),
                        );
                      }
                    },
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF4F46E5)),
                    child: const Text('Create', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  )
                ],
              );
            },
          );
        },
      ),
    );
  }
}
`
    },
    'task_management_screen.dart': {
      desc: 'Screen monitoring task scopes, including scrollable lists, delete, and add new dialog using the (+) button',
      syntax: 'dart',
      code: `// Written by Brian McCarthy
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/time_entry_provider.dart';

class TaskManagementScreen extends StatelessWidget {
  const TaskManagementScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<TimeEntryProvider>(context);

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      appBar: AppBar(
        title: const Text('Manage Workflow Tasks', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF0F172A),
        elevation: 0.5,
      ),
      body: Column(
        children: [
          const SizedBox(height: 8),
          const Text(
            'Written by Brian McCarthy',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF4F46E5)),
          ),
          const SizedBox(height: 8),
          // 4: List view tracking custom Tasks entries with cascading deletion logic built in
          Expanded(
            child: provider.tasks.isEmpty
                ? Center(
                    child: Text(
                      'No tasks registered yet.\\nClick the (+) button to create one.',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.slate.shade400, fontWeight: FontWeight.medium, fontSize: 12),
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(12),
                    itemCount: provider.tasks.length,
                    itemBuilder: (context, index) {
                      final tsk = provider.tasks[index];
                      return Card(
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        elevation: 0,
                        margin: const EdgeInsets.only(bottom: 8),
                        child: ListTile(
                          leading: const CircleAvatar(
                            backgroundColor: Color(0xFFF5F3FF),
                            child: Icon(Icons.assignment_turned_in, color: Color(0xFF4F46E5), size: 18),
                          ),
                          title: Text(
                            tsk.name,
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F172A)),
                          ),
                          // 4: Immediate delete key binding inside item column
                          trailing: IconButton(
                            icon: const Icon(Icons.delete_outline, color: Colors.redAccent, size: 20),
                            onPressed: () {
                              provider.deleteTask(tsk.id);
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Task deleted successfully.')),
                              );
                            },
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
      // 4: Floating Action Button (+) implementing immediate Material Modal Add Dialog triggers
      floatingActionButton: FloatingActionButton(
        backgroundColor: const Color(0xFF4F46E5),
        child: const Icon(Icons.add, color: Colors.white),
        // 4: Trigger Show dialog using the (+) FAB action
        onPressed: () {
          final textController = TextEditingController();

          showDialog(
            context: context,
            builder: (ctx) {
              return AlertDialog(
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                title: const Text('Add Workflow Task', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                content: TextField(
                  controller: textController,
                  autofocus: true,
                  decoration: const InputDecoration(
                    labelText: 'Task Name',
                    hintText: 'e.g., Code Auditing',
                  ),
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pop(ctx),
                    child: const Text('Cancel', style: TextStyle(color: Color(0xFF64748B))),
                  ),
                  ElevatedButton(
                    onPressed: () {
                      final enteredName = textController.text.trim();
                      if (enteredName.isNotEmpty) {
                        final newTask = Task(
                          id: 'task_' + DateTime.now().millisecondsSinceEpoch.toString(),
                          name: enteredName,
                        );
                        provider.addTask(newTask);
                        Navigator.pop(ctx);
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('New task created!')),
                        );
                      }
                    },
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF4F46E5)),
                    child: const Text('Create', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  )
                ],
              );
            },
          );
        },
      ),
    );
  }
}
`
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(flutterSourceFiles[selectedFile].code);
      setCopiedStatus(true);
      setTimeout(() => setCopiedStatus(false), 2000);
    } catch (e) {
      alert('Failed to copy text: ' + String(e));
    }
  };

  // Triggers instant file download of the selected Dart companion script
  const handleDownloadFile = () => {
    try {
      const fileContent = flutterSourceFiles[selectedFile].code;
      const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(fileContent);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", selectedFile);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      alert("Failed to export file: " + String(e));
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F3F4F6] text-slate-900 relative">
      {/* AppBar */}
      <header className="sticky top-0 bg-white border-b border-slate-200 text-slate-900 shadow-none z-10 px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            id="btn-menu-flutter"
            onClick={onOpenDrawer}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 transition-all cursor-pointer"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-extrabold tracking-tight">Flutter (Dart) Core Hub</h1>
            <p className="text-[10px] text-slate-400 font-bold block">Written by Brian McCarthy</p>
          </div>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            id="style-toggle-material"
            onClick={() => setDesignStyle('material')}
            className={`px-2 py-1 text-[9px] font-bold rounded transition-all cursor-pointer ${designStyle === 'material' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-505 hover:text-slate-800'}`}
          >
            Material 3
          </button>
          <button
            id="style-toggle-cupertino"
            onClick={() => setDesignStyle('cupertino')}
            className={`px-2 py-1 text-[9px] font-bold rounded transition-all cursor-pointer ${designStyle === 'cupertino' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-505 hover:text-slate-800'}`}
          >
            Cupertino
          </button>
        </div>
      </header>

      {/* Developer Banner */}
      <div className="text-[10px] text-slate-500 font-bold px-4 py-1.5 bg-slate-100 border-b border-slate-200 text-center tracking-wide uppercase">
        Written by Brian McCarthy
      </div>

      <main className="flex-1 overflow-y-auto px-4 py-4 max-w-2xl mx-auto w-full pb-20 space-y-4">
        
        {/* Intro Alert */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-start gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0 mt-0.5">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-tight">Flutter Production Architecture</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed font-semibold">
                This tracking engine is designed with a single Dart/Flutter code topology representing exactly the views seen in this simulator. Switch between files below to inspect fully-typed cross-platform implementation files programmed by Brian McCarthy.
              </p>
            </div>
          </div>
        </div>

        {/* Selected platform simulation status */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs font-mono text-[10px] space-y-1.5">
          <div className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-150">
            <span className="text-slate-500 font-semibold uppercase">Device target standard</span>
            <span className="text-indigo-600 font-bold">{designStyle === 'material' ? 'Android OS (Material Design)' : 'iOS OS (Apple Cupertino SDK)'}</span>
          </div>
          <div className="text-slate-400 font-medium leading-relaxed px-1">
            Applying {designStyle === 'material' ? 'Roboto display tracking & ripple indicators' : 'SF Pro Display heights & slide path gesture limits'} inside simulated device frames.
          </div>
        </div>

        {/* File Browser Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          {Object.keys(flutterSourceFiles).map((file) => (
            <button
              id={`flutter-file-${file}`}
              key={file}
              onClick={() => setSelectedFile(file)}
              className={`px-3 py-2 text-left rounded-lg border text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
                selectedFile === file
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{file}</span>
            </button>
          ))}
        </div>

        {/* File Info CodeViewer Container */}
        <div className="bg-[#0B0F19] border border-slate-800 rounded-xl overflow-hidden shadow-md">
          {/* Code Header Bar */}
          <div className="bg-[#111827] px-4 py-2.5 border-b border-slate-800 flex justify-between items-center flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[10px] font-mono font-bold text-slate-300">{selectedFile}</span>
              <span className="text-slate-600">•</span>
              <span className="text-[9px] text-slate-400 font-semibold">{flutterSourceFiles[selectedFile].desc}</span>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                id="btn-copy-flutter-code"
                onClick={handleCopyCode}
                className="p-1 px-2 hover:bg-slate-800 active:bg-slate-700 text-slate-400 hover:text-white rounded text-[10px] font-bold transition-all flex items-center space-x-1 font-sans cursor-pointer"
                title="Copy contents to clipboard"
              >
                {copiedStatus ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-500" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>

              <button
                id="btn-download-flutter-code"
                onClick={handleDownloadFile}
                className="p-1 px-2 bg-indigo-950/40 text-indigo-300 border border-indigo-900/60 hover:bg-indigo-900/60 active:bg-indigo-950 text-[10px] font-bold rounded transition-all flex items-center space-x-1 font-sans cursor-pointer"
                title="Download this file"
              >
                <ArrowDownToLine className="w-3 h-3" />
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* Actual Code Listing Block */}
          <div className="p-4 overflow-x-auto text-[11px] font-mono text-slate-300 leading-relaxed max-h-96 select-text whitespace-pre bg-[#0B0F19]">
            {flutterSourceFiles[selectedFile].code}
          </div>

          <div className="bg-[#111827] px-4 py-2 border-t border-slate-800 text-[9px] text-slate-400 text-right font-mono font-semibold">
            Copyright Brian McCarthy • Production Safe
          </div>
        </div>

        {/* Integration Instructions */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-indigo-500" />
            <span>How to compile on mobile devices</span>
          </h4>
          <ol className="text-xs text-slate-500 space-y-2 list-decimal pl-4 font-semibold leading-relaxed">
            <li>Ensure you have the latest stable version of <span className="text-slate-800">Flutter SDK</span> and Dart runtime engines set up on your path environment.</li>
            <li>Create a new directory workspace utilizing the command console: <code className="bg-slate-50 border border-slate-200 text-indigo-650 px-1 py-0.5 rounded text-[10px] font-mono">flutter create chronos_sync</code></li>
            <li>In the created directory, edit your <span className="text-slate-800">pubspec.yaml</span> file to include the required dependencies listed above.</li>
            <li>Install resources and compile the packages: <code className="bg-slate-50 border border-slate-200 text-indigo-650 px-1 py-0.5 rounded text-[10px] font-mono">flutter pub get</code></li>
            <li>Map Dart files corresponding into your project directory framework tree (<code className="text-[10px] font-mono font-bold text-slate-700">lib/main.dart</code>, etc.).</li>
            <li>Run on your local android workspace/devices using: <code className="bg-slate-50 border border-slate-200 text-indigo-650 px-1 py-0.5 rounded text-[10px] font-mono">flutter run -d chrome</code> or target external physical iPhone/iPad simulators.</li>
          </ol>
        </div>

        {/* Safety Disclaimer */}
        <div className="bg-amber-50/50 border border-amber-150 rounded-xl p-3 flex gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[10px] font-semibold text-amber-800 leading-normal">
            Disclaimer: CSV compilation and FL charts require specific system permissions (File writing IO elements, read adapters). Ensure to check iOS App Store plist variables and Android manifest permissions inside your Flutter project setups.
          </p>
        </div>

        {/* Written By Brian McCarthy Screen Footer Info */}
        <div className="text-center py-3.5 space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ChronosSync HD Platform</p>
          <p className="text-[11px] font-bold text-indigo-650">Written by Brian McCarthy</p>
        </div>

      </main>
    </div>
  );
};
