<%= ENV['PR_TITLE'] %>

## 確認事項

- [ ] devでの動作チェック

## dev環境

- [Web](https://web-dev.mimifuwa.cc)
- [Admin](https://admin-dev.mimifuwa.cc)
- [API](https://api-dev.mimifuwa.cc)

## 更新内容

<% pull_requests.each do |pr| -%>
<%= pr.to_checklist_item %>
<% end -%>
