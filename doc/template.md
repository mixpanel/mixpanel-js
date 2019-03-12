---
category: Scott needs to provide this
title: Full API Reference
---

<% for (const namespace of namespaces) { %>
# <%= namespace.name %>

<% for (const item of namespace.items) { %>
<!--<%= item.name %>-->
## <hr><span style="font-family: courier"><%= item.name %></span>
<%= item.description %>
<% } %>

<% } %>

### Usage:
```javascript
// track submission for form id 'register'
mixpanel.track_forms('#register', 'Created Account');
```

### Notes:
Notes when necessary.

| Argument | Type | Description  |
| ------------- |:-------------:| -----:|
| **from_date** | <span style="font-family: courier">string</span></br></span><span style="color: red">required</span>       | info about this awesome parameter   |
