# Frontend Documentation Rule

## Purpose

This rule ensures consistent creation and management of frontend documentation for the MCP Finance application.

## When This Rule Applies

- When creating new frontend documentation
- When documenting dashboards, features, or APIs
- When explaining system architecture or data flow
- When writing troubleshooting guides

## Rules & Standards

### 1. Documentation Location

All frontend documentation must be stored in:

```
/nextjs-mcp-finance/front-docs/
```

**Never** commit documentation to git. This folder is in `.gitignore` for local development reference.

### 2. File Naming Convention

- `[TOPIC]_GUIDE.md` - General guides (e.g., `SETUP_GUIDE.md`)
- `[DASHBOARD]_DASHBOARD.md` - Dashboard docs (e.g., `SCANNER_DASHBOARD.md`)
- `[FEATURE]_ARCHITECTURE.md` - Architecture docs (e.g., `MCP_ARCHITECTURE.md`)
- `TROUBLESHOOTING_[TOPIC].md` - Troubleshooting (e.g., `TROUBLESHOOTING_API.md`)

### 3. Document Structure

Each document must include:

1. **Title** - Clear, descriptive heading
2. **Overview** - Brief description of content
3. **Quick Reference** - Key concepts or commands (optional)
4. **Detailed Sections** - Main content organized logically
5. **Code Examples** - Real, working code from codebase
6. **Troubleshooting** - Common issues and solutions
7. **Related Documentation** - Links to relevant guides

### 4. Code Examples

- Must reference actual files: `[filename](path/to/file.ts)`
- Include line numbers: `[filename:42](path/to/file.ts#L42)`
- Use real code from the codebase
- Add explanatory comments
- Show expected output

**Example:**

```markdown
From [src/app/(dashboard)/scanner/page.tsx:67](<../../src/app/(dashboard)/scanner/page.tsx#L67>):

\`\`\`typescript
const response = await fetch("/api/mcp/scan", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ universe, maxResults }),
});
\`\`\`
```

### 5. Accuracy Requirements

- All code examples must be current and working
- File paths must point to actual files
- Line numbers must be accurate
- APIs documented must match actual implementation
- Verify documentation works before finalizing

### 6. .gitignore Integration

The `front-docs/` directory must be in `.gitignore`:

```
# Frontend Documentation (local development reference)
/nextjs-mcp-finance/front-docs/
```

**Reason:** Documentation is for local development reference and evolves independently from code.

### 7. Skill Usage

Use the `frontend-docs-creator` skill when:

- Creating architecture documentation
- Documenting dashboards
- Writing API integration guides
- Creating troubleshooting guides
- Explaining component patterns

**Invocation:**

```bash
/frontend-docs-creator --topic="Topic" --type="guide"
```

## Common Documentation Topics

### 1. MCP Architecture Guide

- 3-layer system architecture
- Frontend → Backend → MCP flow
- Environment variable setup
- Error troubleshooting

### 2. Dashboard Guides

- Scanner Dashboard
- Analyze Dashboard
- Portfolio Dashboard
- Feature descriptions and usage

### 3. API Integration Guide

- Frontend API client setup
- Calling backend endpoints
- Error handling patterns
- Request/response formats

### 4. Component Guide

- React component patterns
- Common UI components
- Props and behavior
- State management

### 5. Troubleshooting Guide

- Common errors
- Backend connection issues
- Environment setup problems
- Browser debugging

## Documentation Checklist

Before finalizing any frontend documentation:

- [ ] File is in `front-docs/` directory
- [ ] Follows naming convention
- [ ] Has clear title and overview
- [ ] Code examples are accurate and current
- [ ] File paths and line numbers are correct
- [ ] All links work (relative paths)
- [ ] Troubleshooting section included
- [ ] Related documentation linked
- [ ] Markdown formatting is clean

## Best Practices

### Writing

1. **Clarity First** - Explain concepts clearly
2. **Show Examples** - Include real code
3. **Organize Logically** - Use clear headings
4. **Keep Current** - Update when code changes

### Code Examples

1. **Use Real Code** - Extract from actual files
2. **Reference Files** - Link with file path and line number
3. **Add Comments** - Explain what code does
4. **Show Output** - Include expected results

### Organization

1. **One Topic Per File** - Keep focused
2. **Use Headings** - Organize content logically
3. **Link Related Docs** - Cross-reference other guides
4. **Update Table of Contents** - Keep organized

## Examples

### Example 1: Creating MCP Architecture Guide

```
File: /nextjs-mcp-finance/front-docs/MCP_ARCHITECTURE_GUIDE.md

Content:
- Overview of 3-layer architecture
- ASCII diagram showing layers
- Frontend layer explanation
- Backend layer explanation
- MCP Server layer explanation
- Communication flow with code examples
- Environment variable setup
- Error troubleshooting
```

### Example 2: Documenting Scanner Dashboard

```
File: /nextjs-mcp-finance/front-docs/SCANNER_DASHBOARD.md

Content:
- What the scanner does
- Features list
- How to use it
- API endpoints used
- Code structure
- Example walkthrough
- Common issues
```

### Example 3: Troubleshooting API Errors

```
File: /nextjs-mcp-finance/front-docs/TROUBLESHOOTING_API.md

Content:
- Common API errors
- For each error:
  - Symptoms
  - Causes
  - Solutions
  - Example error message
```

## Related Files

- **Skill:** `.claude/skills/frontend-docs-creator/SKILL.md`
- **Rule:** This file
- **Location:** `front-docs/` directory
- **Gitignore:** Must include `/nextjs-mcp-finance/front-docs/`

## Questions?

For help with:

- **Structure** - See frontend-docs-creator skill
- **Templates** - See SKILL.md templates section
- **Best practices** - See SKILL.md best practices
- **Code examples** - See SKILL.md code examples section
