export function buildOgElement(title: string) {
  const display = title.length > 60 ? `${title.slice(0, 60)}…` : title;
  return {
    type: "div",
    props: {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        backgroundColor: "#141414",
        position: "relative",
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: 0,
              left: 0,
              width: 8,
              height: "100%",
              background: "linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)",
            },
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "64px 80px",
              width: "100%",
              height: "100%",
            },
            children: [
              {
                type: "span",
                props: {
                  style: { fontSize: 22, color: "#4b5563", letterSpacing: 3 },
                  children: "mimifuwa.cc",
                },
              },
              {
                type: "span",
                props: {
                  style: { fontSize: 54, fontWeight: 700, color: "#f9fafb", lineHeight: 1.4 },
                  children: display,
                },
              },
            ],
          },
        },
      ],
    },
  };
}
