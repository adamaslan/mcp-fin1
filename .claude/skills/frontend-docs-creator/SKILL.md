---
name: frontend-docs-creator
description: Create and manage frontend documentation for MCP Finance application. Use when documenting frontend architecture, dashboard features, API integration, component behavior, or user guides. Use when creating guides, architecture docs, or troubleshooting resources for frontend developers.
allowed-tools: ["Read", "Write", "Grep", "Glob", "Bash", "Edit"]
trigger-keywords:
  - "frontend documentation"
  - "dashboard guide"
  - "api integration"
  - "component documentation"
  - "architecture diagram"
  - "troubleshooting guide"
  - "frontend guide"
  - "mcp integration"
---

# Frontend Documentation Creator Skill

## Overview

This skill guides creation and maintenance of frontend documentation for the MCP Finance application. It helps document:

- **Dashboard Architecture** - How each dashboard works and relates to others
- **API Integration** - Frontend to Cloud Run communication
- **Component Documentation** - React component usage and patterns
- **MCP Integration** - How the MCP server connects to frontend
- **Troubleshooting Guides** - Common issues and solutions
- **Architecture Diagrams** - Visual system documentation
- **Setup Guides** - Getting started with the frontend

## When to Use This Skill

### Automatic Triggers

Claude will automatically invoke this skill when you mention:

- "Create frontend documentation"
- "Document the dashboard"
- "Explain MCP integration"
- "Create architecture guide"
- "Write troubleshooting guide"

### Manual Invocation

```bash
/frontend-docs-creator [options]
```

### Use Cases

1. **Architecture Documentation**
   - Frontend system architecture
   - Frontend-to-backend communication flow
   - MCP integration diagram
   - Dashboard relationships

2. **Dashboard Documentation**
   - Scanner dashboard guide
   - Analyze dashboard guide
   - Portfolio dashboard guide
   - Other dashboard documentation

3. **API Integration Guides**
   - How frontend calls backend
   - Environment variable setup
   - Error handling patterns
   - Data flow documentation

4. **Component Documentation**
   - React component usage
   - Component props and behavior
   - UI patterns and conventions
   - State management

5. **Troubleshooting Guides**
   - Common frontend errors
   - Backend connection issues
   - Environment setup problems
   - Browser/console debugging

## Documentation Location

All frontend documentation lives in:

```
/nextjs-mcp-finance/front-docs/
├── MCP_ARCHITECTURE_GUIDE.md       # System architecture & error fixes
├── DASHBOARD_GUIDE.md              # Dashboard documentation
├── COMPONENT_GUIDE.md              # React component patterns
├── API_INTEGRATION_GUIDE.md        # Frontend-to-backend communication
├── TROUBLESHOOTING_GUIDE.md        # Common issues and solutions
└── SETUP_GUIDE.md                  # Getting started guide
```

**Important:** All documentation goes in `front-docs/` directory and is ignored by git.

## Core Principles

### Documentation Standards

1. **Clear Structure**
   - Headings organized logically
   - Table of contents for long documents
   - Code examples for technical concepts
   - Diagrams for system architecture

2. **Target Audience**
   - Document for frontend developers
   - Assume basic React knowledge
   - Explain MCP/backend concepts clearly
   - Include troubleshooting for common issues

3. **Code Examples**
   - Real code from the codebase
   - Runnable, tested examples
   - Proper syntax highlighting
   - Comments explaining key concepts

4. **Accuracy**
   - Link to actual files using `[filename](path/to/file)`
   - Include line numbers for code references
   - Test documentation before finalizing
   - Update docs when code changes

### File Naming Convention

```
[TOPIC]_GUIDE.md          # General guides (SETUP_GUIDE.md)
[DASHBOARD]_DASHBOARD.md  # Dashboard docs (SCANNER_DASHBOARD.md)
[FEATURE]_ARCHITECTURE.md # Architecture docs (MCP_ARCHITECTURE.md)
TROUBLESHOOTING_[TOPIC].md # Troubleshooting (TROUBLESHOOTING_API.md)
```

### Content Structure

Each documentation file should follow:

```markdown
# Title

## Overview

Brief description of what this document covers

## Quick Reference

Quick commands or key concepts

## Detailed Guide

[Main content sections]

## Examples

Real code examples from the codebase

## Troubleshooting

Common issues and solutions

## Related Documentation

Links to other relevant docs
```

## Step-by-Step Workflow

### Phase 1: Planning

**Objectives:**

- Determine documentation scope
- Identify target audience
- Gather source material
- Plan content structure

**Process:**

1. Identify what needs documentation
2. Research existing code and patterns
3. Determine document type and structure
4. Plan sections and examples
5. Identify code references

**Inputs:**

- Topic/subject matter
- Target audience
- Existing code examples
- Related documentation

**Outputs:**

- Documentation plan with section outline
- List of code examples to include
- Structure and flow

### Phase 2: Content Creation

**Objectives:**

- Write documentation content
- Include code examples
- Create clear explanations
- Add diagrams/visuals

**Process:**

1. Create document structure with headings
2. Write overview section
3. Add detailed explanation sections
4. Include code examples with references
5. Create visual diagrams
6. Add troubleshooting section
7. Include related documentation links

**Features:**

- Real code examples with file paths
- Clear explanations of concepts
- Visual ASCII diagrams where helpful
- Practical troubleshooting section
- Links to related docs

**Example Structure:**

```markdown
# MCP Finance Architecture

## Overview

The system has 3 layers: Frontend, Backend, MCP Server

## Architecture

[ASCII diagram showing the 3 layers]

## Frontend Layer

[Explains Next.js, components, pages]

## Backend Layer

[Explains Cloud Run, FastAPI, endpoints]

## MCP Server Layer

[Explains Python library, analysis functions]

## Communication Flow

[Explains how layers communicate]

## Examples

[Code examples from actual files]

## Troubleshooting

[Common issues and fixes]
```

### Phase 3: Code Examples & References

**Objectives:**

- Include real, working code examples
- Reference actual files in codebase
- Show practical usage
- Ensure examples are accurate

**Process:**

1. Identify relevant code files
2. Extract relevant code sections
3. Add line numbers and file paths
4. Explain what the code does
5. Add context about when/where to use
6. Include expected output/results

**Format:**

```markdown
### Example: Calling the Scanner API

From [src/app/(dashboard)/scanner/page.tsx:67](<../../src/app/(dashboard)/scanner/page.tsx#L67>):

\`\`\`typescript
const response = await fetch("/api/mcp/scan", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({
universe: selectedUniverse,
maxResults: tierLimits.scanResultsLimit,
}),
});
\`\`\`

**Explanation:** This code calls the scanner API endpoint with the universe and result limit from the user's tier.
```

### Phase 4: Verification & Finalization

**Objectives:**

- Ensure documentation is accurate
- Check all code examples work
- Verify links are correct
- Confirm clarity and completeness

**Verification Checklist:**

- [ ] All code examples are accurate and current
- [ ] File references point to correct locations
- [ ] Links to related docs exist and work
- [ ] No broken references or 404s
- [ ] Code examples are properly formatted
- [ ] Explanations are clear and complete
- [ ] Troubleshooting section covers common issues
- [ ] Document follows naming conventions
- [ ] Title and structure are clear

**Finalization:**

1. Verify all links point to correct files
2. Test code examples work
3. Ensure consistency with other docs
4. Add to documentation index
5. Update table of contents

## Documentation Templates

### Template 1: Architecture Guide

Use for explaining system architecture or data flow.

```markdown
# [Topic] Architecture

## Overview

[Brief description of what this architecture covers]

## System Diagram

[ASCII diagram showing components and relationships]

## Components

[List and explain each component]

## Data Flow

[Explain how data moves through the system]

## Examples

[Practical examples of the architecture in action]

## Related Documentation

[Links to related docs]
```

### Template 2: Dashboard Guide

Use for documenting individual dashboards.

```markdown
# [Dashboard Name] Dashboard

## Overview

[What this dashboard does and why]

## Features

- Feature 1: [Description]
- Feature 2: [Description]
- Feature 3: [Description]

## How It Works

[Explain the workflow and user interactions]

## API Integration

[Which API endpoints this dashboard uses]

## Code Structure

[File locations and component breakdown]

## Example Usage

[Step-by-step walkthrough of using the dashboard]

## Troubleshooting

[Common issues specific to this dashboard]
```

### Template 3: Troubleshooting Guide

Use for documenting common issues and solutions.

```markdown
# Troubleshooting [Topic]

## Overview

[Common issues users might face]

## Issue 1: [Problem Description]

**Symptoms:**

- [Symptom 1]
- [Symptom 2]

**Causes:**

- [Possible cause 1]
- [Possible cause 2]

**Solutions:**

1. [Solution step 1]
2. [Solution step 2]

**Example Output:**
\`\`\`
[Expected output or error message]
\`\`\`

## Issue 2: [Problem Description]

[Same structure as Issue 1]
```

## Common Documentation Topics

### 1. MCP Integration Guide

**Covers:**

- How frontend connects to Cloud Run
- Environment variables needed
- Request/response formats
- Error handling

**Location:** `MCP_ARCHITECTURE_GUIDE.md`

**Key Content:**

- 3-layer architecture diagram
- Frontend → Backend → MCP flow
- Error troubleshooting
- Environment setup

### 2. Dashboard Guide

**Covers:**

- What each dashboard does
- How to use each dashboard
- Features and capabilities
- Related APIs

**Location:** `DASHBOARD_GUIDE.md`

**Key Content:**

- Scanner dashboard features
- Analyze dashboard features
- Portfolio dashboard features
- Comparison with other dashboards

### 3. Component Guide

**Covers:**

- React component patterns
- Common UI components
- Component props
- Usage examples

**Location:** `COMPONENT_GUIDE.md`

**Key Content:**

- Button/Card/Table components
- Form components
- Data display components
- State management patterns

### 4. API Integration Guide

**Covers:**

- Frontend API client setup
- How to call backend endpoints
- Request/response handling
- Error handling patterns

**Location:** `API_INTEGRATION_GUIDE.md`

**Key Content:**

- MCPClient setup
- Calling different endpoints
- Error handling
- Async/await patterns

### 5. Setup Guide

**Covers:**

- Environment variable setup
- Development environment setup
- Running the frontend
- Common setup issues

**Location:** `SETUP_GUIDE.md`

**Key Content:**

- Installation steps
- Environment variables needed
- Running npm dev
- Verification steps

## Usage Examples

### Example 1: Create Architecture Guide

```bash
/frontend-docs-creator \
  --topic="MCP Integration" \
  --type="architecture" \
  --include-examples=true
```

**Process:**

1. Create MCP_ARCHITECTURE_GUIDE.md
2. Add system diagram showing 3 layers
3. Explain each layer's purpose
4. Show code examples of API calls
5. Include error troubleshooting

**Output:**

- `front-docs/MCP_ARCHITECTURE_GUIDE.md` - Complete architecture guide

### Example 2: Document a Dashboard

```bash
/frontend-docs-creator \
  --topic="Scanner Dashboard" \
  --type="dashboard" \
  --include-examples=true
```

**Process:**

1. Create SCANNER_DASHBOARD.md
2. Explain dashboard purpose
3. Document features
4. Show API integration
5. Include usage examples

**Output:**

- `front-docs/SCANNER_DASHBOARD.md` - Dashboard guide

### Example 3: Create Troubleshooting Guide

```bash
/frontend-docs-creator \
  --topic="API Errors" \
  --type="troubleshooting"
```

**Process:**

1. Create TROUBLESHOOTING_API.md
2. List common API errors
3. Explain causes for each
4. Provide solutions
5. Show error messages

**Output:**

- `front-docs/TROUBLESHOOTING_API.md` - Troubleshooting guide

## Integration with Project

### .gitignore

The `front-docs/` directory is in `.gitignore` so:

- Documentation is **not committed** to git
- Useful for local development reference
- Can evolve independently from code
- Team members create their own versions

```
# Frontend Documentation (local development reference)
/nextjs-mcp-finance/front-docs/
```

### .claude Rules

A project rule ensures documentation consistency:

```
location: nextjs-mcp-finance/.claude/rules/frontend-docs.md
triggers: When creating frontend documentation
ensures: Consistent style, format, and location
```

### Usage in Claude Code

When working on frontend code:

1. Reference `front-docs/` files for context
2. Add documentation when adding features
3. Update docs when changing functionality
4. Check troubleshooting guide for known issues

## Documentation Checklist

Before finalizing any frontend documentation:

### Content Checklist

- [ ] Title clearly describes the topic
- [ ] Overview explains the purpose
- [ ] Key concepts are explained clearly
- [ ] Examples are current and working
- [ ] Code samples are properly formatted
- [ ] File paths are accurate
- [ ] Line numbers are correct
- [ ] Troubleshooting section exists
- [ ] Related docs are linked

### Accuracy Checklist

- [ ] All code examples work
- [ ] File references point to correct locations
- [ ] API endpoints match actual code
- [ ] Error messages are accurate
- [ ] Screenshots/diagrams are current
- [ ] Version numbers are correct

### Format Checklist

- [ ] Follows naming convention: `[TOPIC]_GUIDE.md`
- [ ] Uses proper markdown formatting
- [ ] Code blocks have syntax highlighting
- [ ] Headings are properly hierarchical
- [ ] Links use relative paths
- [ ] No broken links or references

### Completeness Checklist

- [ ] Document is placed in `front-docs/`
- [ ] File is organized properly
- [ ] Related documentation is linked
- [ ] Troubleshooting section is complete
- [ ] Examples cover main use cases

## Best Practices

### Writing Clear Documentation

1. **Use Simple Language**
   - Explain concepts clearly
   - Avoid jargon without explanation
   - Use analogies for complex concepts

2. **Show, Don't Tell**
   - Include code examples
   - Show actual output
   - Demonstrate with real use cases

3. **Organize Logically**
   - Use clear headings
   - Group related content
   - Progress from simple to complex

4. **Keep Current**
   - Update when code changes
   - Verify examples still work
   - Fix outdated information

### Code Examples

1. **Use Real Code**
   - Extract from actual files
   - Reference with file path and line number
   - Show surrounding context

2. **Format Properly**
   - Use syntax highlighting
   - Add explaining comments
   - Keep snippets concise

3. **Make Them Runnable**
   - Examples should work
   - Include setup steps if needed
   - Show expected output

### Diagrams & Visuals

1. **ASCII Diagrams**
   - Use for architecture/flows
   - Keep simple and clear
   - Label all components

2. **Tables**
   - Use for comparisons
   - Use for reference material
   - Keep consistent formatting

3. **Markdown Links**
   - Use `[text](path)` format
   - Use relative paths: `../../src/file.ts`
   - Link to specific line numbers

## Related Documentation

Within this project:

- **MCP_ARCHITECTURE_GUIDE.md** - System architecture explanation
- **DASHBOARD_GUIDE.md** - Dashboard documentation
- **Codebase READMEs** - Component and feature documentation
- **Project .claude/CLAUDE.md** - Project guidelines

External resources:

- **Next.js Documentation** - React and framework patterns
- **TypeScript Handbook** - Type system documentation
- **React Documentation** - Component patterns

## Troubleshooting

### Issue: "Documentation is out of sync with code"

**Solution:**

1. Check if code has changed
2. Update examples with new code
3. Verify file paths still exist
4. Test that examples still work

### Issue: "Code example is too large"

**Solution:**

1. Extract only relevant portion
2. Use `[...]` to indicate omitted code
3. Add comment about context
4. Reference full file for complete code

### Issue: "Can't find the right file to reference"

**Solution:**

1. Use Glob to search: `src/**/*.tsx`
2. Use Grep to find functions/exports
3. Check project structure in `.claude/CLAUDE.md`
4. Ask about file locations

## Summary

The Frontend Documentation Creator skill provides a structured approach to documenting the MCP Finance frontend:

1. **Plan** - Identify what needs documentation
2. **Create** - Write clear, well-structured docs
3. **Reference** - Include real code examples
4. **Organize** - Store in `front-docs/` directory
5. **Maintain** - Keep documentation current

By following this workflow, the frontend remains well-documented and easy to understand for all developers.

## Support

For questions about:

- **Documentation structure** - See "Documentation Templates"
- **Code examples** - See "Phase 3: Code Examples & References"
- **Specific topics** - See "Common Documentation Topics"
- **Best practices** - See "Best Practices"
