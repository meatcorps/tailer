# Feature wanted for release

- System to analyze log entry for filtering etc
- Latest open files    

# Features done

- Make syntax highlight configurable
  - Fase 1: Config file on the side.
  - Fase 2: Config editor for Tailer
- Tab support with multiple files
- Drag and drop
- Fix reload issue releasing
- Find working in menu
- Syntax highlight log4net
- Load file by file dialog
- Load file by arguments
- REFACTOR!!!! Smells like a quick weekend code in here
- Cleanup backend code
- Cleanup frontend code
  - Move Ace logic to own component
  - Service for all backend bindings
  - Central service for current document

# Bug fixed

- [BUG] Remember scroll position when switching tabs
- [Refinement] Better way to set current version
- [Bug] When opening tailer the first time open first some file. Then the settings page. Otherwise it won't work. This happens only the first time.
- [Bug] Change the location of configuration file so it always can write. Right know Tailor won't work in the Program Files folder.
