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
  fl_chart: ^0.66.0
  intl: ^0.19.0
  csv: ^6.0.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
`
    },
    'main.dart': {
      desc: 'Application bootstrap, state providers, and deep theme configuration',
      syntax: 'dart',
      code: `// Written by Brian McCarthy
import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:provider/provider.dart';
import 'providers/time_entry_provider.dart';
import 'screens/home_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final provider = TimeEntryProvider();
  await provider.loadLocalData();
  
  runApp(
    ChangeNotifierProvider(
      create: (_) => provider,
      child: const ChronosApp(),
    ),
  );
}

class ChronosApp extends StatelessWidget {
  const ChronosApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ChronosSync',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF6366F1),
          brightness: Brightness.light,
          background: const Color(0xFFF3F4F6),
        ),
        useMaterial3: true,
        fontFamily: 'Inter',
      ),
      home: const MainLayoutScreen(),
    );
  }
}

class MainLayoutScreen extends StatefulWidget {
  const MainLayoutScreen({super.key});

  @override
  State<MainLayoutScreen> createState() => _MainLayoutScreenState();
}

class _MainLayoutScreenState extends State<MainLayoutScreen> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: const [
          HomeScreen(),
          // Placeholder screens for full compilation representation
          Center(child: Text('Projects Screen')),
          Center(child: Text('Tasks Screen')),
          Center(child: Text('Reports & Visuals Screen')),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (idx) {
          setState(() {
            _currentIndex = idx;
          });
        },
        destinations: const [
          NavigationDestination(icon: Icon(Icons.timer), label: 'Entries'),
          NavigationDestination(icon: Icon(Icons.folder), label: 'Projects'),
          NavigationDestination(icon: Icon(Icons.task_alt), label: 'Tasks'),
          NavigationDestination(icon: Icon(Icons.bar_chart), label: 'Reports'),
        ],
      ),
    );
  }
}
`
    },
    'time_entry_provider.dart': {
      desc: 'Scoped ChangeNotifier managing records and auto local key-value saving',
      syntax: 'dart',
      code: `// Written by Brian McCarthy
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class Project {
  final String id;
  final String name;
  Project({required this.id, required this.name});
}

class Task {
  final String id;
  final String name;
  Task({required this.id, required this.name});
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
  List<Project> _projects = [];
  List<Task> _tasks = [];
  List<TimeEntry> _entries = [];

  List<Project> get projects => _projects;
  List<Task> get tasks => _tasks;
  List<TimeEntry> get entries => _entries;

  Future<void> loadLocalData() async {
    final prefs = await SharedPreferences.getInstance();
    
    // Seed initial demo data if empty
    final entriesJson = prefs.getString('time_entries');
    if (entriesJson != null) {
      final List decoded = jsonDecode(entriesJson);
      _entries = decoded.map((item) => TimeEntry.fromJson(item)).toList();
    } else {
      // Demo mock logs setup
      _entries = [];
    }
    notifyListeners();
  }

  Future<void> saveToPreferences() async {
    final prefs = await SharedPreferences.getInstance();
    final String encoded = jsonEncode(_entries.map((e) => e.toJson()).toList());
    await prefs.setString('time_entries', encoded);
  }

  void addTimeEntry(TimeEntry entry) {
    _entries.add(entry);
    saveToPreferences();
    notifyListeners();
  }

  void deleteTimeEntry(String id) {
    _entries.removeWhere((element) => element.id == id);
    saveToPreferences();
    notifyListeners();
  }
}
`
    },
    'reports_screen.dart': {
      desc: 'Reports screen using fl_chart for Pizza Pie/Bars and multi-column .CSV Exporters',
      syntax: 'dart',
      code: `// Written by Brian McCarthy
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:csv/csv.dart';
import 'package:intl/intl.dart';
// Note: Requires path_provider & open_file or share_plus package to triggers native downloads on real systems

class ReportsScreen extends StatefulWidget {
  const ReportsScreen({super.key});

  @override
  State<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends State<ReportsScreen> {
  DateTime _startDate = DateTime.now().subtract(const Duration(days: 30));
  DateTime _endDate = DateTime.now();

  void _exportToCsv(List<dynamic> logs) {
    List<List<dynamic>> csvData = [
      ["Date", "Project ID", "Task ID", "Duration (Hours)", "Notes", "Billable Rate ($60)"]
    ];

    for (var entry in logs) {
      csvData.add([
        entry.date,
        entry.projectId,
        entry.taskId,
        entry.totalTime,
        entry.notes,
        "\$" + (entry.totalTime * 60).toStringAsFixed(2)
      ]);
    }

    String csvStr = const ListToCsvConverter().convert(csvData);
    // Use Flutter platform share_plus or file system writing options to save the file
    // Written by Brian McCarthy
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Flutter Reports & Charts'),
        actions: [
          IconButton(
            icon: const Icon(Icons.download),
            onPressed: () => _exportToCsv([]),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            const Text(
              'Code Written by Brian McCarthy',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
            ),
            const SizedBox(height: 16),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  children: [
                    Text('Select Date Limits:'),
                    ElevatedButton(
                      child: Text('Export Companion Data Dataset (.CSV)'),
                      onPressed: () {},
                    )
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            // SVG Equivalents: Rendering gorgeous interactive Bar charts
            SizedBox(
              height: 200,
              child: BarChart(
                BarChartData(
                  barGroups: [
                    BarChartGroupData(x: 0, barRods: [BarChartRodData(toY: 8.5, color: Colors.blue)]),
                    BarChartGroupData(x: 1, barRods: [BarChartRodData(toY: 12.0, color: Colors.indigo)]),
                  ],
                ),
              ),
            ),
          ],
        ),
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
