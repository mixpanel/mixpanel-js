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
<%= item.notes %><% } %>

<% } %>
<% } %>

| Argument | Type | Description  |
| ------------- |:-------------:| -----:|
| **from_date** | <span style="font-family: courier">string</span></br></span><span style="color: red">required</span>       | info about this awesome parameter   |
