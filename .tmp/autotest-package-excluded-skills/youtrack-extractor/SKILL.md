---
name: youtrack-extractor
description: Extracts task content from YouTrack by link or task ID (e.g., "CA-636 Menu content for BPIF"). Use this skill when the user wants to get information about a YouTrack task, view task details, get comments, or work with tasks from YouTrack. The skill does not save data to files; it keeps it in context for further processing.
---

## Compatibility

- MCP server `youtrack` (required)
- Access to YouTrack with valid credentials

# YouTrack Extractor - Extract Tasks from YouTrack

This skill extracts task content from YouTrack and stores the data in context for further processing.

## When to Use

- User asks to "get task from YouTrack"
- User provides a task link or task ID (e.g., "CA-636")
- Need to get task details for analysis
- Need to get task comments
- User wants to work with a YouTrack task

## Execution Process

### Step 1: Extract Task ID from Input

User may provide:
- Full task link (e.g., `https://company.myjetbrains.com/issue/CA-636`)
- Only task ID (e.g., `CA-636`)
- Task name with ID (e.g., "CA-636 Menu content for BPIF")

Extract the task ID:
- If it's a full link — extract the part after the last `/` or `issue/`
- If it's a name with ID — extract the prefix before the first space (e.g., `CA-636` from `CA-636 Menu content for BPIF`)
- If it's just an ID — use as is

### Step 2: Get Task Details

Use `mcp--youtrack--get_issue` to get full task information:

```
issueId: "<task ID>"
```

Store in context all received data:
- Task ID
- Summary
- Description
- Project
- State
- Type
- Priority
- Assignee
- Reporter
- Created and updated dates
- Tags
- Votes
- Attachments - images from main content
- Links to related issues

### Step 3: Get Comments (REQUIRED)

ALWAYS get task comments using:

```
issueId: "<task ID>"
limit: 10
```

### Step 4: Extract Image Links

Extract ALL image links from:
1. **Main task content** (field `attachments` in `get_issue` response)
2. **Comments** (field `attachments` in each comment from `get_issue_comments`)

For each image, store:
- File name
- MIME type
- Size in bytes
- **Full download URL** - IMPORTANT to save the full URL

### Step 5: Save Data in Context

After receiving data, create a structured object with task data and save in context for further processing:

```typescript
interface YouTrackIssue {
  id: string;                    // Task ID (e.g., "CA-636")
  summary: string;              // Task summary
  description: string;          // Task description
  project: string;               // Project name
  projectKey: string;            // Project key (e.g., "CA")
  state: string;                 // Task state
  type: string;                  // Task type
  priority: string;             // Priority
  assignee: string | null;      // Assignee
  reporter: string;             // Reporter
  created: string;               // Created date
  updated: string;               // Updated date
  resolved: string | null;       // Resolved date (if any)
  tags: string[];                // Tags
  votes: number;                 // Vote count
  comments: Comment[];           // Comments
  images: ImageAttachment[];    // Images from main task content
  links: LinkedIssue[];          // Linked issues
  customFields: Record<string, any>; // Custom fields
  url: string;                   // Task URL
}

interface Comment {
  id: string;
  author: string;
  text: string;
  created: string;
  updated: string;
  attachments: ImageAttachment[]; // Images in comment
}

interface ImageAttachment {
  name: string;           // File name (e.g., "image.png")
  mimeType: string;       // MIME type (e.g., "image/png")
  sizeBytes: number;      // Size in bytes
  url: string;            // FULL download URL
}

interface LinkedIssue {
  id: string;
  summary: string;
  linkType: string;
}
```

### Step 6: Output Result

After extracting data, output a brief summary:

```
Task extracted: {ID}
- Summary: {summary}
- Project: {project}
- State: {state}
- Type: {type}
- Priority: {priority}
- Assignee: {assignee}
- Reporter: {reporter}
- Created: {created}
- Updated: {updated}
- Tags: {tags}
- Votes: {votes}
- Comments: {comments.length}
- Images in task: {images.length}
- Images in comments: {commentImagesCount}
- Linked issues: {links.length}

Data saved in context for further processing.
```

## Error Handling

- If task not found — inform and suggest checking the ID
- If MCP is unavailable — inform about connection error
- If insufficient permissions — inform about access issue
- If task was deleted — inform that task was not found

## Important Reminders

- **DO NOT save data to files** — keep only in context
- After extraction, data is available for further processing within the current session
- If user wants to save data — they will explicitly say so
- Work with each call separately, do not accumulate data
- **ALWAYS get comments** - this is a required step
- **ALWAYS extract images** from main content and comments
- **ALWAYS output full image URLs** - not just file names, but full URL links

## Usage Examples

**Input:**
- Link: `https://company.myjetbrains.com/issue/CA-636`
- Or ID: `CA-636`
- Or name: `CA-636 Menu content for BPIF`

**Expected result:**
- Structured object with task data in context
- Brief summary about the task in chat
- List of all images with FULL URLs

## Output Format

After completion, output:

```
✅ Task from YouTrack extracted and saved in context
ID: {task ID}
Summary: {summary}
Project: {project}
State: {state}
Comments: {comments.length}
Images: {totalImagesCount}

Images in task (full URLs):
1. {name} - {url}
2. {name} - {url}
...

Images in comments (full URLs):
1. {name} - {url}
2. {name} - {url}
...

Data available for further processing.