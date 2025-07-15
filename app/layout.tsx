// // app/layout.tsx
// import { Providers } from "./providers";

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en">

//       <head>
//         <script> window.chtlConfig = { chatbotId: "4777382154" } </script>
// <script async data-id="4777382154" id="chtl-script" type="text/javascript" src="https://chatling.ai/js/embed.js"></script>
//       </head>
//       <body>
//         <Providers>{children}</Providers>
//       </body>
//     </html>
//   );
// }

// app/layout.tsx
import { Providers } from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Chatling chatbot config script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.chtlConfig = { chatbotId: "4777382154" };
            `,
          }}
        />
        {/* Chatling embed loader */}
        <script
          async
          data-id="4777382154"
          id="chtl-script"
          src="https://chatling.ai/js/embed.js"
        ></script>
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
