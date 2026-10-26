<%= ENV['PR_TITLE'] %>

## dev 環境

https://web-vue-dev.mimifuwa.cc

## 更新内容

<% pull_requests.each do |pr| -%>
<%= pr.to_checklist_item %>
<% end -%>
