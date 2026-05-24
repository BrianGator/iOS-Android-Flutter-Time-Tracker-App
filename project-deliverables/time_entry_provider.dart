// iOS-Android-Flutter-Time-Tracker-App
// Written by Brian McCarthy
// Shared State Provider delivering JSON local persistence and empty list initialization.

import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class Project {
  final String id;
  final String name;

  Project({required this.id, required this.name});

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
  };

  factory Project.fromJson(Map<String, dynamic> json) => Project(
    id: json['id'],
    name: json['name'],
  );
}

class Task {
  final String id;
  final String name;

  Task({required this.id, required this.name});

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
  };

  factory Task.fromJson(Map<String, dynamic> json) => Task(
    id: json['id'],
    name: json['name'],
  );
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

  // 5: Local Storage Persistence - Loading JSON Stringified Collections from SharedPreferences
  Future<void> loadLocalData() async {
    final prefs = await SharedPreferences.getInstance();
    
    // Load and decode Projects
    final String? projectsJson = prefs.getString('projects_db');
    if (projectsJson != null) {
      final List decoded = jsonDecode(projectsJson);
      _projects = decoded.map((item) => Project.fromJson(item)).toList();
    } else {
      // Seed default placeholder configurations
      _projects = [
        Project(id: 'p1', name: 'Internal R&D'),
        Project(id: 'p2', name: 'Mobile App Setup'),
        Project(id: 'p3', name: 'Design Specs'),
      ];
    }

    // Load and decode Tasks
    final String? tasksJson = prefs.getString('tasks_db');
    if (tasksJson != null) {
      final List decoded = jsonDecode(tasksJson);
      _tasks = decoded.map((item) => Task.fromJson(item)).toList();
    } else {
      // Seed default placeholder configurations
      _tasks = [
        Task(id: 't1', name: 'UI & Layout Designing'),
        Task(id: 't2', name: 'State Coding & API'),
        Task(id: 't3', name: 'Report Auditing'),
      ];
    }

    // Load and decode Time Entries (Defaults to an empty list as required)
    final String? entriesJson = prefs.getString('time_entries_db');
    if (entriesJson != null) {
      final List decoded = jsonDecode(entriesJson);
      _entries = decoded.map((item) => TimeEntry.fromJson(item)).toList();
    } else {
      _entries = []; // Default clean state
    }
    notifyListeners();
  }

  // 5: Local Storage Persistence - Stringifying and Saving State into SharedPreferences
  Future<void> saveLocalData() async {
    final prefs = await SharedPreferences.getInstance();
    
    final String projectsEncoded = jsonEncode(_projects.map((p) => p.toJson()).toList());
    await prefs.setString('projects_db', projectsEncoded);

    final String tasksEncoded = jsonEncode(_tasks.map((t) => t.toJson()).toList());
    await prefs.setString('tasks_db', tasksEncoded);

    final String entriesEncoded = jsonEncode(_entries.map((e) => e.toJson()).toList());
    await prefs.setString('time_entries_db', entriesEncoded);
  }

  // Project Actions
  void addProject(Project project) {
    _projects.add(project);
    saveLocalData();
    notifyListeners();
  }

  void deleteProject(String id) {
    _projects.removeWhere((p) => p.id == id);
    _entries.removeWhere((e) => e.projectId == id); // Cascade delete
    saveLocalData();
    notifyListeners();
  }

  // Task Actions
  void addTask(Task task) {
    _tasks.add(task);
    saveLocalData();
    notifyListeners();
  }

  void deleteTask(String id) {
    _tasks.removeWhere((t) => t.id == id);
    _entries.removeWhere((e) => e.taskId == id); // Cascade delete
    saveLocalData();
    notifyListeners();
  }

  // Time Entry Actions
  void addTimeEntry(TimeEntry entry) {
    _entries.add(entry);
    saveLocalData();
    notifyListeners();
  }

  void deleteTimeEntry(String id) {
    _entries.removeWhere((entry) => entry.id == id);
    saveLocalData();
    notifyListeners();
  }

  // Helper resolvers for displaying human readable names
  String getProjectName(String projectId) {
    return _projects.firstWhere(
      (p) => p.id == projectId,
      orElse: () => Project(id: '', name: 'Deleted Project'),
    ).name;
  }

  String getTaskName(String taskId) {
    return _tasks.firstWhere(
      (t) => t.id == taskId,
      orElse: () => Task(id: '', name: 'Deleted Task'),
    ).name;
  }
}
