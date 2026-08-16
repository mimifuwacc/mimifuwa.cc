type MessageNode = {
  type: string;
  value?: string;
  children?: MessageNode[];
};

type MessageTree = {
  children: MessageNode[];
};

const messageOpening = /^:::message(?:\s+(alert))?$/;

const textContent = (node: MessageNode): string => {
  if (node.type === "text") return node.value ?? "";
  if (node.children) return node.children.map(textContent).join("");
  return "";
};

const paragraphText = (node: MessageNode): string | undefined =>
  node.type === "paragraph" ? node.children?.map(textContent).join("").trim() : undefined;

const messageMarker = (variant?: string): MessageNode => ({
  type: "text",
  value: variant === "alert" ? "[!DANGER]" : "[!INFO]",
});

export default function remarkMessage() {
  return (tree: MessageTree) => {
    for (let index = 0; index < tree.children.length; index += 1) {
      const opening = paragraphText(tree.children[index])?.match(messageOpening);
      if (!opening) continue;

      const closingIndex = tree.children.findIndex(
        (node, candidateIndex) => candidateIndex > index && paragraphText(node) === ":::",
      );
      if (closingIndex === -1) continue;

      const content = tree.children.slice(index + 1, closingIndex);
      const firstParagraph = content.find((node) => node.type === "paragraph");
      if (firstParagraph?.children) {
        firstParagraph.children.unshift(messageMarker(opening[1]));
      } else {
        content.unshift({ type: "paragraph", children: [messageMarker(opening[1])] });
      }

      tree.children.splice(index, closingIndex - index + 1, {
        type: "blockquote",
        children: content,
      });
    }
  };
}
