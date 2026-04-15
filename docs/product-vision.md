# Product Vision — SnapScreen

## 1. Vision & Mission

### Vision Statement

A world where capturing exactly what you're working on is as effortless as pressing a single key.

### Mission Statement

SnapScreen eliminates the friction between "I want to record this screen" and the recording actually starting — by letting users configure their preferred monitor once and capturing it instantly, every time, with a hotkey.

### Founder's Why

Christian builds software on a dual-monitor setup every day. The problem he ran into wasn't exotic — it was mundane and persistent: the Windows built-in recording shortcut (Win+Alt+R) captures the screen with the active window, not the one you actually want to record. You either accept recording the wrong screen, or you open a heavy app and click through menus every single time.

He looked for the obvious solution — a lightweight tray utility that remembers your monitor preference — and found nothing. OBS is the gold standard but it's a full streaming platform, not a quick-capture tool. Bandicam solves the monitor selection problem but costs money and still adds friction. Xbox Game Bar is convenient but fundamentally limited in multi-monitor control. The gap was clear: no one had built the simple thing.

Building with Claude Code and Cursor means Christian can go from vision to working app faster than ever. This is the right moment for a solo developer to build the utility that should have existed years ago.

### Core Values

**Zero friction, every time.** The moment between wanting to record and actually recording should be as short as possible. Every design decision — from the tray icon to the hotkey to the output filename — is evaluated against this standard. If a feature adds friction for the common case, it doesn't ship in the default experience.

**Reliability over features.** SnapScreen doing one thing perfectly is more valuable than doing five things acceptably. A missed recording because the app crashed or captured the wrong screen is a trust-breaking failure. Core functionality ships only when it's rock solid.

**Respect the user's desktop.** SnapScreen never demands attention it doesn't deserve. No splash screens. No update nags in the middle of a recording. No background telemetry without explicit consent. It lives in the tray and comes when called.

**Ship to learn.** The MVP is friends and family. Feedback from real users shapes the Pro feature roadmap. Assumptions about what people want are explicitly tracked and tested, not treated as facts.

### Strategic Pillars

**The hotkey is the product.** Everything else — the tray icon, the settings panel, the output folder — exists to support one interaction: press key, record exactly the right screen, press key again, done. This principle resolves every scope debate.

**Windows-first, Mac-later.** Building for one platform first means building it right. Electron's cross-platform capability means the Mac port is a configuration change, not a rewrite — but the Windows experience should feel native, not like a web app in a frame.

**Simple by default, configurable on demand.** Default settings should work for 90% of users without any changes. Advanced options (custom hotkey, output format, filename pattern) are available but never surfaced unless the user looks for them.

**Local and offline.** No account required, no cloud sync, no server calls. Everything runs on the user's machine. This makes SnapScreen faster, more private, and more trustworthy than cloud-dependent tools.

### Success Looks Like

Twelve months from now, SnapScreen has 2,000+ downloads on GitHub and a small but vocal community of users who recommend it to colleagues on forums and in Discord servers. The core free tier is widely used and trusted — not a single complaint about recording the wrong screen. The Pro tier has 50+ paying users, funding continued development. Christian has shipped at least two major Pro features (GIF export and webcam overlay) based directly on user feedback. A few developers have opened PRs on the GitHub repo. The product works on Windows and has a stable Mac beta. Most importantly: every user who installs it gets their first successful recording within 60 seconds of setup, with zero surprises.

---

## 2. User Research

### Primary Persona

**Alex, 31, senior developer at a mid-size tech company.** Alex works from home on a two-monitor setup: a 27" primary display with his IDE and browser, and a secondary display for documentation, Slack, and video calls. He records his screen several times a week — bug reproductions for tickets, tutorial clips for team Notion pages, async walkthroughs for code reviews.

His current workflow is broken in a small but persistent way: he presses Win+Alt+R when his cursor is on the primary monitor, Slack pops up a notification on his secondary monitor, his mouse instinctively moves there to dismiss it, and now Xbox Game Bar is recording the wrong screen. Or he has to open OBS, configure a scene for the right monitor, start the recording — and by then the moment he wanted to capture has passed.

Alex has a moderate frustration threshold. He's not going to write an angry tweet about it, but he will immediately install and recommend a tool that solves this cleanly. He's comfortable with GitHub, trusts open-source tools, and will happily pay a small amount for something that saves him daily friction.

### Secondary Personas

**Sam, content creator.** Sam records software tutorials for a YouTube channel with 8,000 subscribers. She uses a dedicated "recording monitor" that shows her recording subject, and keeps her notes, browser, and chat on a second screen. She currently uses OBS but finds it overkill for quick clips. She would switch to SnapScreen for any recording under 15 minutes where she doesn't need multi-scene switching.

**Jordan, remote consultant.** Jordan does async client communication almost entirely through screen recordings — walkthroughs of work completed, explanations of technical decisions, quick bug reports. He records 3–5 times a day and wants nothing between the impulse to record and the recording starting. Currently uses Loom but is frustrated by the Loom desktop app's overhead and the fact that recordings go to the cloud.

**Marco, PC gamer and casual streamer.** Marco streams on Twitch twice a week but also captures gameplay clips just for himself. He wants a dead-simple capture tool that works when OBS isn't running. He cares about zero-overhead start time and doesn't need any streaming features.

### Jobs To Be Done

**Functional jobs.** Start a recording of a specific monitor in under 3 seconds. Stop a recording and have the file immediately accessible. Configure which monitor to record without having to do it every session. Know when the app is recording and when it isn't. Find their recordings in a predictable, organized location.

**Emotional jobs.** Feel in control of their recordings — not at the mercy of which window happened to have focus. Feel confident that the tool will work when they need it without babysitting. Feel like a competent, professional person who captures clean, well-composed recordings rather than messy, wrong-screen clips.

**Social jobs.** Share recordings that look intentional and competent, not accidental. Recommend a simple, reliable tool to colleagues without embarrassment. Be the person on the team who knows the best lightweight recording solution.

### Pain Points

**P1 — Recording the wrong screen (high frequency, high impact).** This happens multiple times a week for multi-monitor users. The current workaround is either crop in post (time-consuming), or open a heavy app every time (friction). The consequence is wasted time and embarrassing clips sent to colleagues.

**P2 — Setup overhead for simple recordings (high frequency, medium impact).** Opening OBS, selecting the right scene/monitor, then starting recording takes 20–45 seconds. For a 30-second clip, the setup time exceeds the recording time. Most users have internalized this friction but immediately recognize it when a better option exists.

**P3 — No clear recording state indicator (medium frequency, medium impact).** With Win+Alt+R it's easy to lose track of whether you're currently recording. Users sometimes record for minutes after they've finished, generating large files that need trimming.

**P4 — Cloud dependency of popular quick-record tools (low frequency, high impact when it hits).** Loom requires internet, syncs automatically, and stores recordings on their servers. Some users have privacy constraints or simply prefer local files. This is a smaller pain point but creates strong preference for local tools among the segment that cares.

### Current Alternatives & Competitive Landscape

**Xbox Game Bar (Win+Alt+R) — closest to the SnapScreen use case, but fundamentally broken for multi-monitor.** It's built in, free, and instant — which is why users keep trying it. The failure is that it records the currently focused monitor, not a pre-selected one. There's no way to pin it to a specific display. Users who rely on it regularly have experienced the wrong-screen problem. Microsoft hasn't addressed this in multiple Windows versions.

**OBS Studio — the power user choice, too much for casual recording.** OBS is excellent if you're streaming or need multi-scene switching. For someone who wants to record a specific monitor and save an MP4, it's 10x more complexity than needed. Installation is ~250MB. Setup requires creating a scene, adding a "Display Capture" source, selecting the monitor — before you've recorded a single thing. It's the right tool for streamers, wrong tool for this use case.

**Bandicam — the closest paid competitor to SnapScreen.** Bandicam explicitly lets you select Display 1 or Display 2 in its screen recording mode, which is exactly the gap SnapScreen fills. The problems: it costs $39.95 (one-time) or $23.97/year, it requires opening the Bandicam window for each recording session rather than living in the tray, and its UI feels dated. It's a legitimate product but not positioned as a lightweight tray utility.

**ShareX — powerful open-source option, but complexity is the barrier.** ShareX can do everything SnapScreen can, plus 40 things SnapScreen won't. That's the problem. New users face a settings panel with dozens of options and no obvious "just record this monitor" workflow. It has a dedicated fanbase but doesn't appeal to users who want minimal friction.

**"Do nothing" / crop in post.** A surprising number of users have normalized the wrong-screen problem and fix it by cropping or trimming recordings after the fact. This is the true baseline that SnapScreen competes with — not just other apps, but the sunk cost of people who have accepted friction as unavoidable.

### Key Assumptions to Validate

**Assumption 1: Users want a persistent monitor preference over a per-session selection.** We assume users always want to record the same monitor, so setting it once is valuable. To validate: ask first 20 users how often they'd want to switch monitors mid-session. If 30%+ say "often," a quick-toggle mechanism becomes a P0 requirement rather than a P1.

**Assumption 2: A system tray utility is the right interaction model.** We assume users are comfortable with tray apps and find the tray-based workflow intuitive. To validate: watch two non-developer users install SnapScreen cold. If either can't find the tray icon or figure out the setup within 60 seconds, the onboarding flow needs work.

**Assumption 3: Win+Shift+R is a safe default hotkey that won't conflict.** We assume this key combination isn't in common use. To validate: test on fresh Windows 11 install and check for conflicts with common developer tools (VS Code, JetBrains, etc.). If conflicts are found, default to a less common combination or prompt the user to set their own on first run.

**Assumption 4: FFmpeg as the recording engine is reliable enough for MVP.** We assume spawning FFmpeg as a child process gives us acceptable latency and stability. To validate: test recording start time from hotkey press to first frame captured. Target is under 1 second. If consistently over 2 seconds, explore Windows Graphics Capture API as a native alternative.

**Assumption 5: MP4 is the right default output format.** We assume users want MP4 files. To validate: in the first feedback round, ask what format they prefer. If 20%+ ask for GIF or WebM, add those as options in the Pro tier. If MP4 has codec issues on certain Windows configurations, resolve before wider launch.

**Assumption 6: Users are willing to install an Electron app for a tray utility.** Electron apps have a reputation for being heavy (~150MB+). Casual users may hesitate. To validate: measure installer download completion rate vs. launch rate. If there's a significant drop-off, investigate Tauri as a future migration path for a smaller binary.

**Assumption 7: Friends/family validation is predictive of broader user satisfaction.** We assume early beta feedback translates to what the general audience wants. To validate: cross-reference feedback from technical users (developers) with feedback from non-technical users (remote workers). If their needs diverge significantly, segment the product positioning.

### User Journey Map

**Awareness.** Alex hears about SnapScreen from a colleague in Slack who drops a link: "finally found something for the dual-monitor recording problem." He's had the wrong-screen frustration three times this week already. He clicks through to GitHub — sees the README, understands immediately what it does. No buzzwords. The description is "Record the monitor you choose, not whatever screen has focus." He downloads the installer.

**Consideration.** Alex scans the README for red flags before installing. It's open-source, no account required, no cloud sync. He notes it uses Electron (slightly heavy) but decides it's worth trying. Download takes 20 seconds. He runs the installer — standard Windows prompts, nothing suspicious.

**First use.** SnapScreen appears in his system tray. He right-clicks, sees "Select Monitor" — his two monitors are listed as Display 1 (1920×1080) and Display 2 (2560×1440). He selects Display 2, his primary work screen. A brief notification: "SnapScreen will now record Display 2." He presses Win+Shift+R. A small red recording indicator appears in the tray. He types a few lines of code on his keyboard for 10 seconds. Presses Win+Shift+R again. A notification: "Recording saved — click to open folder." He opens it. The MP4 is there, labeled `SnapScreen_2026-04-14_143200.mp4`. He plays it. It's exactly Display 2. Nothing else.

**Magic moment.** Alex immediately sends the recording to a teammate via Slack. Then, five minutes later, he needs to record a quick bug reproduction. He presses Win+Shift+R. Records. Presses again. Done. The setup from the first use transferred — he didn't have to do anything. That's the moment. He texts the colleague who sent him the link: "ok yeah this is exactly what i needed."

**Habit formation.** Over the next two weeks, SnapScreen becomes Alex's default recording tool for everything under 20 minutes. He changes the output folder to a synced directory. He customizes the hotkey to match his muscle memory from a previous tool. The app updates itself quietly. He doesn't think about it — it just works.

**Advocacy.** Three weeks in, a colleague complains about the wrong-screen problem in a standup. Alex sends them the GitHub link without hesitation. He's now the person on his team who knows the clean solution.

---

## 3. Product Strategy

### Product Principles

**The hotkey is the entire product.** If a user has to open an app window to accomplish anything in the core recording flow, something has gone wrong. The tray icon and settings panel exist to configure the hotkey behavior, not to replace it.

**One monitor, one recording.** SnapScreen records exactly one monitor per session. Multi-monitor simultaneous recording, region capture, and window capture are explicitly out of scope for MVP. This constraint keeps the implementation clean and the user expectation clear.

**Persistence as a feature.** The app remembers everything: selected monitor, hotkey, output folder, last-used settings. A user who installs SnapScreen and configures it once should never have to configure it again unless they choose to.

**Visible state, silent operation.** When recording, the tray icon changes color/indicator so the user always knows the app's state. The app otherwise operates without notifications, popups, or interruptions.

**Trust through reliability.** Every feature shipped must work 100% of the time before it ships. A recording that fails silently is worse than a tool that doesn't exist. Error states are visible and actionable.

### Market Differentiation

SnapScreen's differentiation is architectural, not feature-based. It doesn't win by having more features than OBS — it wins by having fewer. The entire product is organized around a single user intent: "record the screen I chose, right now." Every other tool in this space either doesn't let you pre-select a monitor (Xbox Game Bar), is designed for a different primary use case (OBS, Bandicam), or is so feature-rich that the simple flow is buried (ShareX).

This matters to the target user because they don't want to think about their recording tool. Developers, remote workers, and content creators use screen recording as an output mechanism for their actual work — they're not here to become experts in recording software. SnapScreen is a utility in the truest sense: like a power strip or a keyboard shortcut manager. You configure it once, and then it disappears until you need it.

The defensibility comes from the niche focus combined with distribution. By positioning as a developer-friendly open-source utility first, SnapScreen earns the trust of the community that influences tool adoption across organizations. Developers recommend tools to their colleagues. A tool that earns a reputation for reliability in that community has an outsized acquisition advantage relative to its size.

### Magic Moment Design

The magic moment is: press Win+Shift+R, and exactly the right monitor starts recording immediately, with zero setup.

For this moment to happen reliably, the following must be true in the product: the monitor selection persists across app restarts; the hotkey is registered globally (works even when SnapScreen isn't the focused window); the recording starts within 1 second of the hotkey press; the tray icon updates immediately to show recording state; and the output file is saved to the expected location with a predictable name.

The path from install to magic moment must be achievable in under 2 minutes. The sequence is: install → tray icon appears → right-click → select monitor → press hotkey → first successful recording. This five-step flow must work perfectly on the first try. If step 3 is confusing, if step 4 shows confusing display names, or if step 5 starts recording the wrong screen, trust is broken and the user is unlikely to give the app a second chance.

This magic moment is achievable in the MVP. All five steps map directly to P0 requirements. No deferred features are required to get here.

### MVP Definition

**Tray application shell.** A minimal Electron app that starts minimized to the tray on launch, registers a tray icon with a context menu, and launches on Windows startup (configurable). This is the container for everything else.

**Monitor enumeration and selection.** The tray context menu lists all connected monitors (Display 1, Display 2, etc.) with their resolutions, so users can identify which is which. The selected monitor is persisted via electron-store and survives restarts. If the selected monitor is disconnected, the app gracefully falls back to the primary display and notifies the user.

**Global hotkey registration.** A configurable hotkey (default: Win+Shift+R) that works system-wide — even when SnapScreen is not the focused window. Start press begins recording, stop press ends it. Hotkey binding is persisted. A conflict detection mechanism warns the user if their chosen hotkey is already in use by another application.

**Screen capture via FFmpeg.** When the hotkey is pressed, SnapScreen spawns an FFmpeg child process targeting the selected display's screen coordinates. Output is MP4 (H.264 video, AAC audio from system/mic — configurable). Recording starts within 1 second of hotkey press. FFmpeg process is terminated cleanly on stop. Temporary files are cleaned up if the recording is interrupted.

**Tray state indicator.** The tray icon changes to a red recording indicator while recording is active. The tooltip shows "SnapScreen — Recording in progress" vs. "SnapScreen — Ready." This is the user's primary signal about recording state.

**Output file management.** Recordings are saved to a user-configured output folder (default: `%USERPROFILE%\Videos\SnapScreen`). Files are named with timestamp format: `SnapScreen_YYYY-MM-DD_HHmmss.mp4`. After saving, a brief tray notification with "Recording saved — click to open folder" appears.

**Settings panel.** A minimal window (opened from tray menu) for changing: monitor selection, hotkey binding, output folder, startup behavior, and audio source (system audio, microphone, both, or none).

### Explicitly Out of Scope

**Multi-monitor simultaneous recording.** The entire product is premised on recording one specific monitor. Adding multi-monitor recording would require a different UI paradigm, a different FFmpeg configuration, and a different output file strategy. Defer to Post-Launch Phase if demand exists.

**Region/window capture.** SnapScreen captures full monitors. Capturing a specific application window or a custom-drawn region is a feature for tools like ShareX. Defer permanently unless it emerges as the top user request after launch.

**Webcam overlay.** A popular Pro feature request among content creators, but it adds significant complexity to the FFmpeg pipeline and UI. Target for the first Pro tier release, not the MVP.

**GIF export.** Useful for developers sharing quick bug reproductions in GitHub issues, but adds a conversion step and file size considerations. Target for Pro tier.

**Cloud upload or sharing.** SnapScreen is intentionally local-only. Cloud sync is not on the MVP roadmap and will only be added if a clear majority of users request it. The local-first positioning is a feature, not a limitation.

**Annotation/editing tools.** Post-recording editing, trimming, and annotation are out of scope entirely. SnapScreen captures; users edit in their existing tools. This constraint is permanent.

**Mac version.** The Electron architecture makes a Mac port relatively straightforward, but testing, code-signing, notarization, and distribution through the Mac ecosystem require significant additional work. Target for 6-month milestone after Windows validation.

### Feature Priority (MoSCoW)

**Must Have (MVP):** Tray application with system tray icon and context menu; monitor enumeration and persistent selection; global hotkey registration (start/stop); single-monitor screen capture via FFmpeg; recording state indicator in tray; MP4 output to user-defined folder; basic settings panel (monitor, hotkey, folder, audio source); launch at Windows startup option.

**Should Have (shortly post-MVP):** Hotkey conflict detection; graceful fallback when selected monitor is disconnected; audio source selection (system audio, mic, both, none); recording duration display in tray tooltip; "Recording saved" notification with click-to-open-folder; installer with proper Windows code signing.

**Could Have (Pro tier candidates):** GIF export; webcam overlay; custom filename patterns; recording history panel; screenshot (single frame) capture mode; bitrate/quality settings; configurable countdown before recording starts.

**Won't Have (this time):** Multi-monitor simultaneous recording; region/window capture; video editing or trimming; cloud sync or upload; annotation tools; Mac version in MVP; mobile companion app.

### Core User Flows

**Flow 1 — First-time setup (trigger: fresh install)**
User launches SnapScreen → tray icon appears → tooltip shows "SnapScreen — click to get started" → user right-clicks → context menu shows monitor list with "Select Monitor to Record" header → user selects their preferred display → selection is saved → notification: "SnapScreen is set to record [Display Name]. Press Win+Shift+R to start." → setup complete. Success criteria: setup completed in under 60 seconds without consulting documentation.

**Flow 2 — Record and save (trigger: user wants to capture a screen)**
User presses Win+Shift+R (from anywhere, any app in focus) → tray icon turns red → recording begins on selected monitor within 1 second → user performs the action they want to capture → user presses Win+Shift+R again → recording stops → tray icon returns to normal → notification: "Recording saved — [filename]. Click to open folder." → MP4 saved in output folder. Success criteria: start-to-save completed without opening any app window; recording covers correct monitor only; file plays back without errors.

**Flow 3 — Change settings (trigger: user wants different monitor/hotkey/folder)**
User right-clicks tray icon → selects "Settings" → settings panel opens → user changes desired setting → clicks Save (or auto-saves on change) → settings window closes → new settings take effect immediately, no restart required. Success criteria: setting change takes effect on the next hotkey press without app restart.

### Success Metrics

**Primary metric:** First successful recording completion rate — the percentage of users who install SnapScreen and complete at least one successful recording that saves a valid MP4 file. Target: 80%+ within the first session.

**Secondary metrics:** Average time from install to first successful recording (target: under 2 minutes); hotkey start-to-recording-begin latency (target: under 1 second); settings change without restart success rate (target: 100%); recording failure rate / crash rate (target: under 1%).

**Leading indicators for validation:** Number of shares/recommendations from initial 20 users; number of repeat recordings per user per week (target: 3+); qualitative feedback mentioning "just works" or "exactly what I needed"; GitHub stars in the first 30 days after public launch.

**Thresholds:** Good — 70% first-session recording completion, 3+ recordings per week per active user. Great — 85%+ first-session completion, 5+ recordings per week, 3+ organic GitHub stars per week.

### Risks

**Risk 1: FFmpeg latency exceeds 1 second on start.** Likelihood: medium. Impact: high — breaks the "instant recording" core promise. Mitigation: Profile FFmpeg startup on several Windows configurations during development. If latency is consistently over 1 second, explore pre-launching FFmpeg in idle mode or switching to Windows Graphics Capture API (DXGI Desktop Duplication) for lower-latency capture.

**Risk 2: Global hotkey conflicts with common developer tools.** Likelihood: medium. Impact: medium — affects primary workflow for the target audience. Mitigation: Test Win+Shift+R against VS Code, JetBrains suite, and Slack on Windows 11. Implement conflict detection that warns the user at setup. Default to a less common combination if conflicts are found in testing.

**Risk 3: Electron app size deters casual installers.** Likelihood: medium. Impact: low-to-medium — may reduce conversion from download to install. Mitigation: Document the app size transparently in the README. If install abandonment is high, consider Tauri as a future rewrite for a smaller binary. Don't optimize prematurely for size at the cost of development velocity.

**Risk 4: Electron security vulnerabilities.** Likelihood: low. Impact: medium. Mitigation: Follow Electron security best practices — enable contextIsolation and sandbox, disable nodeIntegration in renderer, use contextBridge for IPC. Keep Electron updated. The app never makes web requests except potentially for update checks.

**Risk 5: Windows code signing requirements.** Likelihood: high (known). Impact: medium — unsigned apps trigger Windows SmartScreen warnings, which may deter non-technical users. Mitigation: Obtain a code-signing certificate before any public launch beyond friends/family. Plan for this cost (~$70–200/year for OV certificate) in the 6-month roadmap.

**Risk 6: Monitor detection edge cases.** Likelihood: medium. Impact: medium — monitors being added/removed, display scaling changes, or RDP sessions could cause unexpected behavior. Mitigation: Test all monitor enumeration edge cases during development. Implement graceful fallback to primary display when configured monitor is unavailable.

**Risk 7: Insufficient differentiation from ShareX for technical users.** Likelihood: low. Impact: low — the audience who would choose ShareX over SnapScreen is self-selecting for complexity. Mitigation: Position explicitly as the "zero-config, hotkey-first" alternative. Don't compete on features. Win on simplicity and opinionated defaults.

---

## 4. Brand Strategy

### Positioning Statement

For Windows users with dual or extended monitor setups who are frustrated by recording the wrong screen, SnapScreen is the lightweight tray utility that lets you pre-select your recording monitor and capture it instantly with a hotkey. Unlike Xbox Game Bar (which captures whatever has focus) and OBS Studio (which requires complex setup), SnapScreen remembers your preference and starts recording the right screen in under one second — every time.

### Brand Personality

SnapScreen is the competent, quiet colleague who always has exactly the right tool for the job and hands it to you without making a fuss about it. Not flashy. Not self-promotional. Just reliably, dependably good at the one thing it does.

If SnapScreen were a person, they'd be a senior developer who's been building their own productivity toolkit for years. They dress practically. They don't talk about their tools at parties, but when someone else complains about a problem, they casually mention they solved it a while ago and offer to share the fix. They're approachable — happy to help a non-technical person set up their laptop — but they default to doing the thing, not explaining how impressive the thing is.

This personality shows up in the product as: clean, uncluttered UI; terse but helpful notifications; documentation that explains the "why" alongside the "what"; no onboarding wizards or feature tours; a GitHub README that gets to the point in the first three sentences.

### Voice & Tone Guide

**Voice (constant):** Direct, helpful, calm, technically competent. SnapScreen talks like it knows what it's doing and trusts that you do too. It never uses filler phrases, never over-explains, and never adds qualifiers to things it's confident about.

**Tone shifts by context:**

| Context | DO | DON'T |
|---|---|---|
| Onboarding / first run | "Right-click the tray icon to choose your recording monitor." | "Welcome to SnapScreen! We're so excited you're here. Let's get you set up on your recording journey!" |
| Success state | "Recording saved — SnapScreen_2026-04-14_143200.mp4" | "Great job! Your recording was saved successfully! 🎉" |
| Error state | "Recording failed — FFmpeg not found. Reinstall SnapScreen to fix this." | "Oops! Something went wrong. Please try again." |
| Settings | "Output folder: C:\Users\Alex\Videos\SnapScreen (click to change)" | "Where do you want your amazing recordings to go?" |
| Marketing copy | "Record the screen you mean to record. Nothing else." | "The ultimate screen recording solution for power users who demand perfection!" |

### Messaging Framework

**Tagline:** Record the right screen. Every time.

**Homepage headline:** The screen recorder that remembers which screen you want.

**Value propositions:**
1. Set your monitor once — SnapScreen remembers it across restarts and sessions.
2. One hotkey to start, one to stop — no app windows, no menus, no mouse clicks required.
3. Lightweight and local — no account, no cloud, no overhead. Your recordings stay on your machine.

**Feature descriptions:**
- Monitor selector: "Tell SnapScreen which monitor to record. It won't forget."
- Global hotkey: "Press Win+Shift+R from any app, in any window. SnapScreen starts recording immediately."
- Local MP4 output: "Recordings save to your Videos folder the moment you stop. No cloud required."

**Objection handlers:**
- "I already have OBS." → "SnapScreen is for recordings that aren't worth the OBS setup. Keep OBS for streaming. Use SnapScreen for everything else."
- "Doesn't Xbox Game Bar do this?" → "Xbox Game Bar records whichever screen has focus — there's no way to pre-select a monitor. SnapScreen fixes exactly that."
- "I'm worried about Electron being heavy." → "It's about 180MB installed. The tradeoff is a tool that works cross-platform and can be ported to Mac. If that bothers you, watch for the Tauri build."

### Elevator Pitches

**5-second:** "A tray app that records exactly the monitor you choose, every time, with one hotkey."

**30-second:** "If you use two monitors on Windows, you've probably recorded the wrong screen by accident. SnapScreen fixes that. You configure which monitor to record once, and from then on, pressing a hotkey starts recording that screen immediately — no app to open, no menu to navigate. It runs quietly in the system tray and gets out of your way."

**2-minute:** "Anyone who works on a dual-monitor setup has hit this problem: you press Win+Alt+R to record your screen, but Windows captures whichever monitor has the active window at that moment — not the one you actually want. The obvious solutions are either too complex (OBS requires creating scenes and sources before you can record anything) or don't solve the underlying problem (Xbox Game Bar still can't pre-select a monitor). So I built SnapScreen. You install it, right-click the tray icon, pick your monitor, and that's it. Every time you press the hotkey, that exact monitor starts recording. Press again, it stops and saves an MP4 to your Videos folder. No accounts. No cloud. No app window to open. It lives in your system tray and comes when you call it. I'm distributing it free to start — I want to prove it works reliably before I introduce a Pro tier with things like GIF export and webcam overlay. It's for developers, remote workers, and content creators who are tired of recording the wrong screen."

### Competitive Differentiation Narrative

Xbox Game Bar ships on every Windows PC and handles 80% of casual recording use cases well. The 20% it doesn't handle is the dual-monitor power user — someone who has two screens, always wants to record a specific one, and currently has no native way to express that preference. OBS fills this gap for streamers willing to spend 20 minutes on configuration, but it's absurd overhead for a developer who needs a 30-second clip. Bandicam addressed the monitor selection problem but asks you to pay $40 for a piece of software that still requires opening a full application window before each recording session.

SnapScreen enters this space with a specific, narrow thesis: the right interaction model for casual screen recording is a system tray utility, not an application. You configure it once, and then it disappears. The difference isn't features — it's the interaction model, the persistence of your preferences, and the trust that the app will capture exactly what you told it to capture. That's the bet.

### Brand Anti-Patterns

Never sound like enterprise software. Avoid words like "leverage," "solution," "seamless experience," "empower," or "unlock." If it sounds like it belongs in a Microsoft product pitch deck, cut it.

Never use stock photography of people looking happily at laptop screens. If SnapScreen ever needs imagery, it should be honest screenshots of the actual product, screen recordings, or technical diagrams. The product's credibility comes from the product working, not from aspirational lifestyle photography.

Never show an upsell in the middle of a workflow. If a recording is in progress, nothing else happens — no notifications, no "upgrade to Pro" prompts, no anything. The recording experience is sacred.

Never use exclamation points or emoji in functional UI copy. Reserve them for genuinely rare events (first recording ever completed, major milestone). Overusing celebration language makes genuine success states meaningless.

Never make the app feel like it wants something from you. No NPS prompts during active recording sessions. No "we noticed you've been using SnapScreen for 7 days — would you write a review?" No dark patterns around rating requests or email collection.

---

## 5. Design Direction

### Design Philosophy

**Function determines form.** Every visual element earns its place by supporting the core interaction. Tray icon, context menu, settings panel, notifications — each one is designed to communicate exactly one thing clearly. No decorative elements that don't carry meaning.

**Windows-native but opinionated.** SnapScreen uses Windows 11 Fluent Design conventions — acrylic blur, rounded corners, consistent use of system fonts — but applies them selectively and with intention. The goal is "feels at home on Windows 11" without looking like a default Windows app.

**Information density at the settings level.** The tray context menu is sparse by design. The settings panel can afford slightly more density — it's a deliberate interaction, not an ambient one. But even the settings panel should never require scrolling on a 1080p display.

**States communicate status.** The tray icon is the primary status channel. Its appearance should unambiguously convey three states: ready, recording, and error. No guessing, no subtle animations that could be missed.

### Visual Mood

Clean and modern, Windows 11-native. Think the design language of Windows' own system utilities — Settings, Snip & Sketch — but with slightly more personality and polish. Soft rounded corners throughout. Subtle Mica/acrylic background effect where appropriate (settings window). A restrained color palette that uses accent colors only for actionable elements and status indicators.

The aesthetic reference point is somewhere between Windows 11's Fluent Design system and a well-crafted Electron app like Discord (for the tray presence) or VS Code (for the settings panel). It should feel immediately familiar to any Windows 11 user, but with the attention to detail that says "someone who cares built this."

### Color Palette

**Primary:** #0078D4 — Microsoft Fluent blue, familiar to Windows users, used for primary buttons, active states, selected monitor highlight.
CSS variable: `--color-primary`
Tailwind config: `primary: '#0078D4'`
When to use: CTAs, active selections, links.

**Primary hover:** #106EBE
CSS variable: `--color-primary-hover`
Tailwind config: `primary-hover: '#106EBE'`

**Secondary:** #005A9E — deeper blue for pressed/active states.
CSS variable: `--color-secondary`

**Accent/Recording:** #C42B1C — Microsoft's standard red, used for recording indicator.
CSS variable: `--color-recording`
Tailwind config: `recording: '#C42B1C'`
When to use: Tray icon recording state, recording indicator badge, stop button.

**Background:** #F3F3F3 (light) / #202020 (dark)
CSS variable: `--color-background`

**Surface:** #FFFFFF (light) / #2D2D2D (dark) — card and panel backgrounds.
CSS variable: `--color-surface`

**Surface elevated:** #FAFAFA (light) / #383838 (dark) — for menus and dropdowns.
CSS variable: `--color-surface-elevated`

**Text primary:** #1A1A1A (light) / #F3F3F3 (dark)
CSS variable: `--color-text`

**Text muted:** #6B6B6B (light) / #9D9D9D (dark)
CSS variable: `--color-text-muted`

**Border:** #E0E0E0 (light) / #3A3A3A (dark)
CSS variable: `--color-border`

**Success:** #107C10 (Microsoft green)
CSS variable: `--color-success`

**Warning:** #797673
CSS variable: `--color-warning`

**Error:** #C42B1C (same as recording — intentional)
CSS variable: `--color-error`

### Typography

SnapScreen uses the Windows system font stack to feel native, with Inter as a fallback for cross-platform consistency.

**Heading font:** Segoe UI Variable (Windows 11 system font), with fallback to `Inter, -apple-system, sans-serif`
CSS variable: `--font-heading: 'Segoe UI Variable', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif`
Weights to load: 400 (regular), 600 (semibold), 700 (bold)
Google Fonts equivalent: `Inter` (for non-Windows builds)

**Body font:** Same stack as heading — Segoe UI Variable.
CSS variable: `--font-body: 'Segoe UI Variable', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif`
Weights: 400 (regular), 500 (medium)

**Mono font:** `Cascadia Code, Consolas, 'Courier New', monospace` — for file paths, hotkey display, technical values.
CSS variable: `--font-mono`

**Type scale:**
```
--text-xs:   0.6875rem;  /* 11px — labels, captions */
--text-sm:   0.75rem;    /* 12px — secondary info, tooltips */
--text-base: 0.875rem;   /* 14px — body text, menu items */
--text-lg:   1rem;       /* 16px — section headers */
--text-xl:   1.125rem;   /* 18px — panel titles */
--text-2xl:  1.25rem;    /* 20px — window titles */
```

**Line heights:**
```
--leading-tight:  1.2   /* Headings */
--leading-normal: 1.5   /* Body text */
--leading-relaxed: 1.6  /* Descriptions */
```

### Spacing & Layout

Base unit: 4px. All spacing is a multiple of 4px.

```
--space-1:  4px
--space-2:  8px
--space-3:  12px
--space-4:  16px
--space-5:  20px
--space-6:  24px
--space-8:  32px
--space-10: 40px
--space-12: 48px
```

**Settings panel:** Maximum width 480px, minimum height 320px. Never taller than 600px. Padding: 24px on all sides. Section separators: 24px vertical space + 1px `--color-border` divider.

**Tray context menu:** Width 220px. Item height: 36px. Vertical padding per item: 8px. Horizontal padding: 12px. Section headers: 11px uppercase label, 8px bottom padding.

**Minimum spacing between interactive elements:** 8px.

**No maximum content width constraints** within the settings panel — the panel itself is the constraint.

### Component Philosophy

**Rounded corners:** 8px for panels and cards; 6px for buttons and inputs; 4px for badges and chips; 0px for full-width dividers.

**Shadows:** Only one level of elevation — a subtle `0 2px 8px rgba(0,0,0,0.08)` for the settings window on Windows. No drop shadows on individual components within the panel.

**Buttons:** Primary button — filled `--color-primary` background, white text, 6px radius, 32px height, 16px horizontal padding. On hover: `--color-primary-hover`. On press: `--color-secondary`. Disabled: `--color-text-muted` background, `--color-surface` text. No button shadows.

**Input fields:** 1px `--color-border` border, 4px radius, 32px height, 10px horizontal padding. Focus state: 2px `--color-primary` border, no shadow. Error state: 2px `--color-error` border.

**Select/dropdown:** Same as input field styling. Use the native Windows select element unless the design requires custom behavior — native controls are more accessible and familiar.

**Checkboxes and toggles:** Use native Windows-style checkboxes or Fluent-style toggles. Avoid custom implementations that look inconsistent with the OS.

### Iconography & Imagery

**Icon library:** Fluent UI System Icons (Microsoft's open-source icon set). Use the 20px variant for menu items; 16px for status indicators. This ensures the app looks native on Windows.

**Tray icon variants:** Three variants required in ICO format (16px, 32px, 48px): idle state (SnapScreen logo, neutral), recording state (same logo with red dot badge), error state (same logo with yellow warning badge).

**No illustrations.** SnapScreen is a utility — it doesn't need illustrations, hero images, or decorative graphics. The product is the UI.

**Screenshots for documentation:** Use clean Windows 11 screenshots with the default light theme, 1920×1080 resolution, with a neutral desktop background. Avoid showing personal files or other open applications in documentation screenshots.

### Accessibility Commitments

**Color contrast:** All text meets WCAG 2.1 AA minimum — 4.5:1 ratio for normal text, 3:1 for large text and UI components. `--color-primary` (#0078D4) on white meets AA. Recording red (#C42B1C) paired with white meets AA.

**Keyboard navigation:** Every settings panel control is keyboard-accessible. Tab order follows reading order (left-to-right, top-to-bottom). All actions reachable without a mouse.

**Focus indicators:** 2px solid `--color-primary` focus ring on all interactive elements. No removing focus outlines.

**Screen reader support:** All tray icon states have descriptive accessible names. Settings panel controls have associated labels. Status notifications are announced via the Windows notification system (which screen readers pick up automatically).

**Minimum touch targets:** Not applicable for MVP (Windows desktop only, mouse-primary). Consider if a touch-optimized mode is added later for tablet users.

**Text scaling:** The settings panel respects Windows display scale settings (100%, 125%, 150%). Test at 125% scale minimum.

### Motion & Interaction

**Transition duration defaults:** 150ms for hover state changes; 200ms for panel open/close; 100ms for button press feedback. No transitions longer than 300ms.

**Easing:** `ease-out` for entering states (elements appearing, panels opening); `ease-in` for exiting states; `ease-in-out` for reversible transitions (hover states).

**What animates:** Panel open/close (fade + slight scale from 0.97 to 1.0); hover states on buttons and menu items (background color transition); tray icon recording badge (immediate on/off — no animation, to ensure the state change is instant and unambiguous).

**What doesn't animate:** Recording start/stop — the state change is immediate and functional. No countdown animations before recording begins (unless the user enables a countdown in settings, which is a P2 feature). No loading spinners for operations that complete in under 200ms.

**Loading states:** Only shown for operations that might take more than 500ms — primarily: listing monitors on first launch, and changing output folder. Use an inline spinner within the relevant UI element, never a full-panel loading overlay.

**Error states:** Shown inline, next to the control that failed. Never a blocking modal unless it's a critical app-level failure (e.g., FFmpeg missing). Error text appears immediately, without animation.

### Design Tokens

The complete reference for all design tokens, as CSS variables + Tailwind config values:

```css
:root {
  /* Colors */
  --color-primary:          #0078D4;
  --color-primary-hover:    #106EBE;
  --color-secondary:        #005A9E;
  --color-recording:        #C42B1C;
  --color-background:       #F3F3F3;
  --color-surface:          #FFFFFF;
  --color-surface-elevated: #FAFAFA;
  --color-text:             #1A1A1A;
  --color-text-muted:       #6B6B6B;
  --color-border:           #E0E0E0;
  --color-success:          #107C10;
  --color-warning:          #797673;
  --color-error:            #C42B1C;

  /* Typography */
  --font-heading: 'Segoe UI Variable', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-body:    'Segoe UI Variable', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono:    'Cascadia Code', Consolas, 'Courier New', monospace;
  --text-xs:    0.6875rem;
  --text-sm:    0.75rem;
  --text-base:  0.875rem;
  --text-lg:    1rem;
  --text-xl:    1.125rem;
  --text-2xl:   1.25rem;
  --leading-tight:   1.2;
  --leading-normal:  1.5;
  --leading-relaxed: 1.6;

  /* Spacing */
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;

  /* Border radius */
  --radius-sm:  4px;
  --radius-md:  6px;
  --radius-lg:  8px;

  /* Shadows */
  --shadow-panel: 0 2px 8px rgba(0,0,0,0.08);

  /* Transitions */
  --transition-fast:   150ms ease-out;
  --transition-normal: 200ms ease-out;
  --transition-slow:   300ms ease-in-out;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --color-background:       #202020;
    --color-surface:          #2D2D2D;
    --color-surface-elevated: #383838;
    --color-text:             #F3F3F3;
    --color-text-muted:       #9D9D9D;
    --color-border:           #3A3A3A;
    --shadow-panel:           0 2px 8px rgba(0,0,0,0.3);
  }
}
```

```typescript
// tailwind.config.ts — extend block
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: '#0078D4',
        hover:   '#106EBE',
        active:  '#005A9E',
      },
      recording: '#C42B1C',
      success:   '#107C10',
      warning:   '#797673',
      error:     '#C42B1C',
      surface: {
        DEFAULT:  '#FFFFFF',
        elevated: '#FAFAFA',
      },
      border: '#E0E0E0',
    },
    fontFamily: {
      sans: ['Segoe UI Variable', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      mono: ['Cascadia Code', 'Consolas', 'Courier New', 'monospace'],
    },
    fontSize: {
      'xs':   ['0.6875rem', { lineHeight: '1.5' }],
      'sm':   ['0.75rem',   { lineHeight: '1.5' }],
      'base': ['0.875rem',  { lineHeight: '1.5' }],
      'lg':   ['1rem',      { lineHeight: '1.4' }],
      'xl':   ['1.125rem',  { lineHeight: '1.3' }],
      '2xl':  ['1.25rem',   { lineHeight: '1.2' }],
    },
    spacing: {
      '1': '4px',
      '2': '8px',
      '3': '12px',
      '4': '16px',
      '5': '20px',
      '6': '24px',
      '8': '32px',
      '10': '40px',
      '12': '48px',
    },
    borderRadius: {
      'sm': '4px',
      'md': '6px',
      'lg': '8px',
    },
    boxShadow: {
      'panel': '0 2px 8px rgba(0,0,0,0.08)',
    },
    transitionDuration: {
      'fast':   '150',
      'normal': '200',
      'slow':   '300',
    },
  }
}
```
