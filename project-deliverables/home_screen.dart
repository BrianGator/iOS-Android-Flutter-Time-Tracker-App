// iOS-Android-Flutter-Time-Tracker-App
// Written by Brian McCarthy
// Home Screen Module with tabs, list views, grouped collapsibles, delete capability & hamburger drawer.

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

    // Grouping helper to group entries by Project ID
    final groupedEntries = <String, List<TimeEntry>>{};
    for (var entry in provider.entries) {
      groupedEntries.putIfAbsent(entry.projectId, () => []).add(entry);
    }

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        backgroundColor: const Color(0xFFF8FAFC),
        appBar: AppBar(
          title: const Text(
            'ChronosSync Tracker',
            style: TextStyle(fontWeight: FontWeight.black, fontSize: 16, color: Color(0xFF0F172A)),
          ),
          backgroundColor: Colors.white,
          elevation: 0,
          border: const Border(bottom: BorderSide(color: Color(0xFFE2E8F0))),
          actions: [
            Padding(
              padding: const EdgeInsets.only(right: 16.0),
              child: Center(
                child: Text(
                  'Brian McCarthy',
                  style: TextStyle(color: Colors.indigo.shade600, fontSize: 10, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ],
          bottom: const TabBar(
            labelColor: Color(0xFF4F46E5),
            unselectedLabelColor: Color(0xFF64748B),
            indicatorColor: Color(0xFF4F46E5),
            indicatorWeight: 3,
            labelStyle: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
            unselectedLabelStyle: TextStyle(fontWeight: FontWeight.medium, fontSize: 13),
            tabs: [
              Tab(text: 'All Entries'),
              Tab(text: 'Grouped by Projects'),
            ],
          ),
        ),
        
        // 1: Hamburger Menu (Drawer) implementing core workflows & pristine route management
        drawer: Drawer(
          backgroundColor: Colors.white,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              DrawerHeader(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: const BoxDecoration(
                        color: Color(0xFF4F46E5),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.timer, color: Colors.white, size: 24),
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      'ChronosSync App',
                      style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.black, tracking-tight),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Written by Brian McCarthy',
                      style: TextStyle(color: Color(0xFF38BDF8), fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
              ListTile(
                leading: const Icon(Icons.timer_outlined, color: Color(0xFF4F46E5)),
                title: const Text('Time Log Entries', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF1E293B))),
                onTap: () {
                  Navigator.pop(context); // Soft dismiss
                },
              ),
              // 1: Route to Projects lists
              ListTile(
                leading: const Icon(Icons.folder_open_outlined, color: Color(0xFF4F46E5)),
                title: const Text('Workspace Projects', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF1E293B))),
                onTap: () {
                  Navigator.pop(context); // Dismiss Drawer
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const ProjectManagementScreen()),
                  );
                },
              ),
              // 1: Route to Tasks lists
              ListTile(
                leading: const Icon(Icons.check_box_outlined, color: Color(0xFF4F46E5)),
                title: const Text('Workflow Tasks', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF1E293B))),
                onTap: () {
                  Navigator.pop(context); // Dismiss Drawer
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const TaskManagementScreen()),
                  );
                },
              ),
              const Spacer(),
              const Divider(color: Color(0xFFE2E8F0)),
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Text(
                      'COMPACT PLATFORM v1.1.2_HD',
                      style: TextStyle(fontSize: 8, color: Color(0xFF94A3B8), fontWeight: FontWeight.black, fontStyle: FontStyle.italic),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Written by Brian McCarthy',
                      style: TextStyle(fontSize: 10, color: Colors.indigo.shade600, fontWeight: FontWeight.bold),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        body: TabBarView(
          children: [
            // ================== TAB 1: ALL TIME LOGS ==================
            provider.entries.isEmpty
                // 1: All Entries Tab - Empty-state UI represented dynamically
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(32.0),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Colors.indigo.shade50,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.timer_off_outlined, size: 48, color: Color(0xFF4F46E5)),
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'No Time Entries Logged',
                            style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'Click the floating (+) button to catalog your duration rates.\nWritten by Brian McCarthy.',
                            textAlign: TextAlign.center,
                            style: TextStyle(fontSize: 11, color: const Color(0xFF64748B), fontWeight: FontWeight.medium, height: 1.4),
                          ),
                        ],
                      ),
                    ),
                  )
                // 1: All Entries Tab - Beautiful Scrolling Logs List
                : ListView.builder(
                    padding: const EdgeInsets.all(12),
                    itemCount: provider.entries.length,
                    itemBuilder: (context, index) {
                      final log = provider.entries[index];
                      return Card(
                        color: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                          side: const BorderSide(color: Color(0xFFE2E8F0)),
                        ),
                        elevation: 0,
                        margin: const EdgeInsets.only(bottom: 8),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                          child: Row(
                            children: [
                              Container(
                                width: 4,
                                height: 38,
                                decoration: BoxDecoration(
                                  color: const Color(0xFF4F46E5),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      provider.getProjectName(log.projectId),
                                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F172A)),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      provider.getTaskName(log.taskId),
                                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF64748B)),
                                    ),
                                    if (log.notes.isNotEmpty) ...[
                                      const SizedBox(height: 4),
                                      Text(
                                        log.notes,
                                        style: const TextStyle(fontSize: 11, fontStyle: FontStyle.italic, color: Color(0xFF94A3B8)),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ],
                                  ],
                                ),
                              ),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFEEF2FF),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      '${log.totalTime.toStringAsFixed(1)} hrs',
                                      style: const TextStyle(color: Color(0xFF4F46E5), fontWeight: FontWeight.bold, fontSize: 11),
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    log.date,
                                    style: const TextStyle(fontSize: 9, color: Color(0xFF94A3B8), fontWeight: FontWeight.bold),
                                  ),
                                ],
                              ),
                              const SizedBox(width: 8),
                              // 1: Dynamic delete button bound to provider operations
                              IconButton(
                                icon: const Icon(Icons.delete_outline, color: Colors.redAccent, size: 20),
                                tooltip: 'Delete this time entry',
                                onPressed: () {
                                  provider.deleteTimeEntry(log.id);
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

            // ================== TAB 2: GROUPED BY PROJECTS ==================
            groupedEntries.isEmpty
                // 1: Grouped by Projects - Empty-state UI represented dynamically
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(32.0),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Colors.sky.shade50,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.folder_off_outlined, size: 48, color: Colors.sky),
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'No Grouped Project Hours',
                            style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'Work logs are automatically categorized here per project.\nWritten by Brian McCarthy.',
                            textAlign: TextAlign.center,
                            style: TextStyle(fontSize: 11, color: const Color(0xFF64748B), fontWeight: FontWeight.medium, height: 1.4),
                          ),
                        ],
                      ),
                    ),
                  )
                // 1: Grouped by Projects - High-fidelity Expansion Details
                : ListView.builder(
                    padding: const EdgeInsets.all(12),
                    itemCount: groupedEntries.length,
                    itemBuilder: (context, index) {
                      final projectId = groupedEntries.keys.elementAt(index);
                      final entryList = groupedEntries[projectId]!;
                      final double sum = entryList.fold(0.0, (previous, element) => previous + element.totalTime);

                      return Card(
                        color: Colors.white,
                        margin: const EdgeInsets.only(bottom: 10),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                          side: const BorderSide(color: Color(0xFFE2E8F0)),
                        ),
                        elevation: 0,
                        child: Theme(
                          data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
                          child: ExpansionTile(
                            leading: const Icon(Icons.folder_open, color: Color(0xFF4F46E5)),
                            title: Text(
                              provider.getProjectName(projectId),
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F172A)),
                            ),
                            subtitle: Text(
                              '${entryList.length} total work log${entryList.length == 1 ? "" : "s"}',
                              style: const TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.bold),
                            ),
                            trailing: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                              decoration: BoxDecoration(
                                color: const Color(0xFF0F172A),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                '${sum.toStringAsFixed(1)} hrs',
                                style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 11),
                              ),
                            ),
                            children: entryList.map((e) {
                              return Container(
                                decoration: const BoxDecoration(
                                  border: Border(top: BorderSide(color: Color(0xFFF1F5F9))),
                                ),
                                child: ListTile(
                                  dense: true,
                                  title: Text(
                                    provider.getTaskName(e.taskId),
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF1E293B)),
                                  ),
                                  subtitle: Text(
                                    e.date + (e.notes.isNotEmpty ? ' • ${e.notes}' : ''),
                                    style: const TextStyle(fontSize: 10, color: Color(0xFF64748B)),
                                  ),
                                  trailing: Text(
                                    '${e.totalTime.toStringAsFixed(1)}h',
                                    style: const TextStyle(fontWeight: FontWeight.black, fontSize: 11, color: Color(0xFF4F46E5)),
                                  ),
                                ),
                              );
                            }).toList(),
                          ),
                        ),
                      );
                    },
                  ),
          ],
        ),

        floatingActionButton: FloatingActionButton(
          backgroundColor: const Color(0xFF4F46E5),
          hoverColor: const Color(0xFF4338CA),
          tooltip: 'Log New Work Entry',
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
