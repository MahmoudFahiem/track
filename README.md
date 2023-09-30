# AmpleTrack
An unofficial Amplenote plugin that integrates with Toggl track

## Setup

1. Go to https://track.toggl.com/profile
2. Scroll down to find your API Token and note it.
3. In the sidebar, click on "Organization," then "Workspaces".
4. Click on your active workspace and note the workspace ID from the URL(ex: https://track.toggl.com/organization/4057000/workspaces/5076677/members)
5. Go to AmpleTrack settings.
6. Set API Token and Workspace Id.

## Usage
To start/stop an entry:
- You can start/stop entry tracking from a task item using `{AmpleTrack: Start}` and `{AmpleTrack: Stop}`.
- You can also start/stop entry tracking from a note option using the same commands.

Bonus:
- If there is a running entry that don't match the current note/task you invoked the commands from a nice prompt is shown to confirm if you want stop/override the current entry.