<%= ENV['PR_TITLE'] %>

## dev環境

| サービス | URL                           |
| -------- | ----------------------------- |
| Web      | https://web-dev.mimifuwa.cc   |
| Admin    | https://admin-dev.mimifuwa.cc |
| API      | https://api-dev.mimifuwa.cc   |

## 更新内容

<% pull_requests.each do |pr| -%>
<%= pr.to_checklist_item %>
<% end -%>
