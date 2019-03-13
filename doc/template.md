---
category: Scott needs to provide this
title: Full API Reference
---

<% for (const namespace of namespaces) { %>
# <%= namespace.name %>

<% for (const item of namespace.items) { %>
## <hr><span style="font-family: courier"><%= item.name %></span>
<%= item.description %>
<% if (item.usage)  { %>
### Usage:
```javascript
<%= item.usage %>
```
<% } %><% if (item.notes)  { %>
### Notes:
<%= item.notes %><% } %><% if (item.arguments.length) { %>

| Argument | Type | Description |
| ------------- |:-------------:| ----- |<% for (const arg of item.arguments) { %>
| **<%= arg.name %>** | <span style="font-family: courier"><%= arg.types %></span></br></span><% if (arg.required) { %><span style="color: red">required</span><% } %> | <%= arg.description %> |<% } %><% } %>

<% } %>
<% } %>
