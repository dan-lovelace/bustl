module.exports = {
  siteMetadata: {
    title: "bus.tl",
    titleTemplate: "%s - Organize your whiteboard notes",
    description:
      "Organization tools for real-life whiteboards. Use photos from your whiteboarding sessions to manage projects, organize brainstorms and boost productivity.",
    url: "https://bus.tl",
    image: "src/images/icon.png",
  },
  plugins: [
    "gatsby-plugin-postcss",
    "gatsby-plugin-react-helmet",
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        name: "bus.tl",
        short_name: "bus.tl",
        start_url: "/",
        icon: "src/images/icon.png",
      },
    },
  ],
};
