// iOS-Android-Flutter-Time-Tracker-App
// Written by Brian McCarthy
// Form screen implementing Workspace Project/Task Dropdowns, validators and persistent saving.

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
  String _selectedDate = DateTime.now().toIso8651String().split('T')[0];

  @override
  void dispose() {
    _timeController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // 2: Access context states and models from state providers securely
    final provider = Provider.of<TimeEntryProvider>(context);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text(
          'Log Time Entry',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Color(0xFF0F172A)),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        border: const Border(bottom: BorderSide(color: Color(0xFFE2E8F0))),
        foregroundColor: const Color(0xFF0F172A),
      ),
      body: GestureDetector(
        onTap: () => FocusScope.of(context).unfocus(), // Dismiss keyboard on background tap
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Top brand credentials
                const Text(
                  'CHRONOS DATA CAPTURE WORKSTATION',
                  style: TextStyle(fontWeight: FontWeight.black, fontSize: 9, color: Color(0xFF4F46E5), letterSpacing: 1.1),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 2),
                const Text(
                  'Written by Brian McCarthy',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Color(0xFF64748B)),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 20),

                // Form Container Card
                Card(
                  color: Colors.white,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                    side: const BorderSide(color: Color(0xFFE2E8F0)),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(20.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // ================== DROP DOWN: PROJECT ==================
                        const Text(
                          'Workspace Project *',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF1E293B)),
                        ),
                        const SizedBox(height: 6),
                        // 2: Dropdown populated dynamically from Provider list objects
                        DropdownButtonFormField<String>(
                          value: _selectedProjectId,
                          hint: const Text('Select active project', style: TextStyle(fontSize: 12)),
                          decoration: InputDecoration(
                            fillColor: const Color(0xFFF8FAFC),
                            filled: true,
                            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(10),
                              borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(10),
                              borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                            ),
                          ),
                          items: provider.projects.map((proj) {
                            return DropdownMenuItem<String>(
                              value: proj.id,
                              child: Text(proj.name, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.semibold)),
                            );
                          }).toList(),
                          validator: (value) => value == null ? 'Please select a workspace project' : null,
                          onChanged: (value) {
                            setState(() {
                              _selectedProjectId = value;
                            });
                          },
                        ),
                        const SizedBox(height: 18),

                        // ================== DROP DOWN: TASK ==================
                        const Text(
                          'Workflow Task *',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF1E293B)),
                        ),
                        const SizedBox(height: 6),
                        // 2: Dropdown populated dynamically from Provider list objects
                        DropdownButtonFormField<String>(
                          value: _selectedTaskId,
                          hint: const Text('Select current task', style: TextStyle(fontSize: 12)),
                          decoration: InputDecoration(
                            fillColor: const Color(0xFFF8FAFC),
                            filled: true,
                            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(10),
                              borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(10),
                              borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                            ),
                          ),
                          items: provider.tasks.map((task) {
                            return DropdownMenuItem<String>(
                              value: task.id,
                              child: Text(task.name, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.semibold)),
                            );
                          }).toList(),
                          validator: (value) => value == null ? 'Please select an active task' : null,
                          onChanged: (value) {
                            setState(() {
                              _selectedTaskId = value;
                            });
                          },
                        ),
                        const SizedBox(height: 18),

                        // ================== LOG TIME INPUT ==================
                        const Text(
                          'Duration (Hours) *',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF1E293B)),
                        ),
                        const SizedBox(height: 6),
                        TextFormField(
                          controller: _timeController,
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                          decoration: InputDecoration(
                            hintText: 'e.g., 2.5 or 0.75',
                            hintStyle: const TextStyle(fontWeight: FontWeight.normal, fontSize: 12),
                            fillColor: const Color(0xFFF8FAFC),
                            filled: true,
                            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(10),
                              borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(10),
                              borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                            ),
                          ),
                          validator: (value) {
                            if (value == null || value.trim().isEmpty) {
                              return 'Hours quantity required';
                            }
                            final valParsed = double.tryParse(value);
                            if (valParsed == null || valParsed <= 0) {
                              return 'Enter solid positive decimal value';
                            }
                            if (valParsed > 24) {
                              return 'Maximum 24 hours log per entry limit';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 18),

                        // ================== ACTIVE NOTE SECTION ==================
                        const Text(
                          'Workspace Work Notes',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF1E293B)),
                        ),
                        const SizedBox(height: 6),
                        TextFormField(
                          controller: _notesController,
                          maxLines: 2,
                          style: const TextStyle(fontSize: 12),
                          decoration: InputDecoration(
                            hintText: 'Describe details of what you worked on...',
                            hintStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.normal),
                            fillColor: const Color(0xFFF8FAFC),
                            filled: true,
                            contentPadding: const EdgeInsets.all(12),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(10),
                              borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(10),
                              borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                            ),
                          ),
                        ),
                        const SizedBox(height: 18),

                        // ================== DATE SELECTOR FIELD ==================
                        const Text(
                          'Specific Logged Date',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF1E293B)),
                        ),
                        const SizedBox(height: 6),
                        InkWell(
                          onTap: () async {
                            final pickedDate = await showDatePicker(
                              context: context,
                              initialDate: DateTime.now(),
                              firstDate: DateTime(2025),
                              lastDate: DateTime(2030),
                              builder: (context, child) {
                                return Theme(
                                  data: Theme.of(context).copyWith(
                                    colorScheme: const ColorScheme.light(
                                      primary: Color(0xFF4F46E5),
                                      onPrimary: Colors.white,
                                      onSurface: Color(0xFF0F172A),
                                    ),
                                  ),
                                  child: child!,
                                );
                              },
                            );
                            if (pickedDate != null) {
                              setState(() {
                                _selectedDate = pickedDate.toIso8601String().split('T')[0];
                              });
                            }
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF8FAFC),
                              border: Border.all(color: const Color(0xFFE2E8F0)),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.between,
                              children: [
                                Text(_selectedDate, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                                const Icon(Icons.calendar_month, size: 18, color: Color(0xFF4F46E5)),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // 2: Complete time-entry form working submit buttons
                ElevatedButton(
                  onPressed: () {
                    if (_formKey.currentState!.validate()) {
                      final generatedId = 'log_' + DateTime.now().millisecondsSinceEpoch.toString();
                      final totalTimeDouble = double.parse(_timeController.text.trim());

                      final newEntry = TimeEntry(
                        id: generatedId,
                        projectId: _selectedProjectId!,
                        taskId: _selectedTaskId!,
                        totalTime: totalTimeDouble,
                        date: _selectedDate,
                        notes: _notesController.text.trim(),
                      );

                      // Save log permanently to Shared Preferences local storage via provider
                      provider.addTimeEntry(newEntry);

                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Time Entry saved successfully.')),
                      );

                      Navigator.pop(context); // Return back to previous screen
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF4F46E5),
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  child: const Text(
                    'Save Time Entry',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
