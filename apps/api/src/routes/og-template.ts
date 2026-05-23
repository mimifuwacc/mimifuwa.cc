export function buildOgElement(title: string, tags: string[] = []) {
  const AVATAR = "https://github.com/mimifuwacc.png";
  const fontSize = title.length > 40 ? 52 : title.length > 20 ? 62 : 72;

  return {
    type: "div",
    props: {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "linear-gradient(135deg, #f0f7fa 0%, #e8f4f8 60%, #ddeef5 100%)",
        padding: "72px 80px 56px",
        position: "relative",
        overflow: "hidden",
      },
      children: [
        // 装飾円（右上）
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              right: -120,
              top: -120,
              width: 480,
              height: 480,
              borderRadius: "50%",
              backgroundColor: "#1a82a8",
              opacity: 0.08,
            },
          },
        },
        // 装飾円（左下）
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              left: -60,
              bottom: -60,
              width: 280,
              height: 280,
              borderRadius: "50%",
              backgroundColor: "#1a82a8",
              opacity: 0.05,
            },
          },
        },
        // タグ（左上）
        ...(tags.length > 0
          ? [
              {
                type: "div",
                props: {
                  style: { display: "flex", flexWrap: "wrap", gap: 10 },
                  children: tags.slice(0, 5).map((tag) => ({
                    type: "span",
                    props: {
                      style: {
                        fontSize: 20,
                        color: "#64748b",
                        backgroundColor: "rgba(100,116,139,0.12)",
                        padding: "5px 16px",
                        borderRadius: 9999,
                        fontWeight: 600,
                      },
                      children: `#${tag}`,
                    },
                  })),
                },
              },
            ]
          : []),
        // タイトル
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flex: 1,
              alignItems: "center",
            },
            children: [
              {
                type: "span",
                props: {
                  style: {
                    fontSize,
                    fontWeight: 700,
                    color: "#0f172a",
                    lineHeight: 1.3,
                    letterSpacing: "-0.02em",
                  },
                  children: title,
                },
              },
            ],
          },
        },
        // フッター: アバター＋@mimifuwacc
        {
          type: "div",
          props: {
            style: { display: "flex", alignItems: "center", gap: 14 },
            children: [
              {
                type: "img",
                props: {
                  src: AVATAR,
                  width: 44,
                  height: 44,
                  style: { borderRadius: 22 },
                },
              },
              {
                type: "span",
                props: {
                  style: { fontSize: 22, color: "#475569", fontWeight: 500 },
                  children: "id:mimifuwacc",
                },
              },
            ],
          },
        },
      ],
    },
  };
}
