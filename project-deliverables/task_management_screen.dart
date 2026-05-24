// iOS-Android-Flutter-Time-Tracker-App
// Written by Brian McCarthy
// Screen managing workflow tasks list, custom alert dialog inputs and provider delete mappings.

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/time_entry_provider.dart';

class TaskManagementScreen extends StatelessWidget {
  const TaskManagementScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Access context and trigger responsive state updates
    final provider = Provider.of<TimeEntryProvider>(context);

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      appBar: AppBar(
        title: const Text(
          'Manage Tasks',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F172A)),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        border: const Border(bottom: BorderSide(color: Color(0xFFE2E8F0))),
        foregroundColor: const Color(0xFF0F172A),
      ),
      body: Column(
        children: [
          const SizedBox(height: 12),
          const Text(
            'Written by Brian McCarthy',
            style: TextStyle(fontWeight: FontWeight.black, fontSize: 10, color: Color(0xFF4F46E5), letterSpacing: 1),
          ),
          const SizedBox(height: 8),

          // 4: List design for workspace tasks with immediate cascade action triggers
          Expanded(
            child: provider.tasks.isEmpty
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(32.0),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.assignment_turned_in_outlined, size: 40, color: Colors.slate.shade300),
                          const SizedBox(height: 12),
                          const Text(
                            'No Tasks Configured',
                            style: TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold, fontSize: 13),
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            'Press (+) to register tasks.',
                            style: TextStyle(color: Color(0xFF64748B), fontSize: 11),
                          ),
                        ],
                      ),
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    itemCount: provider.tasks.length,
                    itemBuilder: (context, index) {
                      final task = provider.tasks[index];
                      return Card(
                        color: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                          side: const BorderSide(color: Color(0xFFE2E8F0)),
                        ),
                        elevation: 0,
                        margin: const EdgeInsets.only(bottom: 6),
                        child: ListTile(
                          dense: true,
                          leading: Container(
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF5F3FF),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Icon(Icons.assignment_turned_in, color: Color(0xFF4F46E5), size: 16),
                          ),
                          title: Text(
                            task.name,
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF0F172A)),
                          ),
                          // 4: Task deletion control trigger
                          trailing: IconButton(
                            icon: const Icon(Icons.delete_outline, color: Colors.redAccent, size: 18),
                            onPressed: () {
                              // Scaffold prompt to warn user and clean lists cascadingly
                              provider.deleteTask(task.id);
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
      
      // 4: Button (+) triggered modal overlays
      floatingActionButton: FloatingActionButton(
        backgroundColor: const Color(0xFF4F46E5),
        tooltip: 'Create New Task',
        child: const Icon(Icons.add, color: Colors.white),
        // 4: Modal dialog called via (+) triggers
        onPressed: () {
          final textController = TextEditingController();

          showDialog(
            context: context,
            barrierDismissible: false,
            builder: (ctx) {
              return AlertDialog(
                backgroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                title: const Row(
                  children: [
                    Icon(Icons.assignment, color: Color(0xFF4F46E5), size: 20),
                    SizedBox(width: 8),
                    Text('Add Task Scope', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                  ],
                ),
                content: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Text(
                      'Provide a descriptive name below for the workflow task. Cascades deletion to child entry logs automatically.',
                      style: TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                    ),
                    const SizedBox(height: 14),
                    TextField(
                      controller: textController,
                      autofocus: true,
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                      decoration: InputDecoration(
                        labelText: 'Task Name',
                        labelStyle: const TextStyle(fontSize: 12),
                        hintText: 'e.g., QA Unit Testing',
                        hintStyle: const TextStyle(fontWeight: FontWeight.normal, fontSize: 11),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                  ],
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pop(ctx),
                    child: const Text('Cancel', style: TextStyle(color: Color(0xFF64748B), fontWeight: FontWeight.bold, fontSize: 12)),
                  ),
                  ElevatedButton(
                    onPressed: () {
                      final textValue = textController.text.trim();
                      if (textValue.isNotEmpty) {
                        final newId = 'task_' + DateTime.now().millisecondsSinceEpoch.toString();
                        final newTaskObj = Task(id: newId, name: textValue);

                        // Save using model provider controller
                        provider.addTask(newTaskObj);
                        Navigator.pop(ctx);

                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Workflow task saved successfully.')),
                        );
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF4F46E5),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    child: const Text('Create', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                  ),
                ],
              );
            },
          );
        },
      ),
    );
  }
}
