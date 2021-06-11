import React from 'react';
import NextDocument, {Html, Head, Main, NextScript} from 'next/document';

class Document extends NextDocument {
    static async getInitialProps(ctx) {
        const initialProps = await NextDocument.getInitialProps(ctx);

        // Determine if class name should be added
        return {
            ...initialProps,
            shouldShow: true
        };
    }

    render() {
        return (
            <Html>
                <Head>
                    {/*<meta name="viewport" content="width=device-width, initial-scale=1" />*/}
                    <link href="https://fonts.googleapis.com/css?family=Poppins:300,400,500,600,700" rel="stylesheet"/>
                    <link href="/assets/plugins/custom/fullcalendar/fullcalendar.bundle.css?v=7.0.4" rel="stylesheet"/>
                    <link href="/assets/plugins/global/plugins.bundle.css?v=7.0.4" rel="stylesheet"/>
                    <link href="/assets/plugins/custom/prismjs/prismjs.bundle.css?v=7.0.4" rel="stylesheet"/>
                    <link href="/assets/css/style.bundle.css?v=7.0.4" rel="stylesheet"/>
                    <link href="/assets/css/themes/layout/header/base/light.css?v=7.0.4" rel="stylesheet"/>
                    <link href="/assets/css/themes/layout/header/menu/light.css?v=7.0.4" rel="stylesheet"/>
                    <link href="/assets/css/themes/layout/brand/dark.css?v=7.0.4" rel="stylesheet"/>
                    <link href="/assets/css/themes/layout/aside/dark.css?v=7.0.4" rel="stylesheet"/>
                    <style jsx global>{`#__next {display: flex; flex: 1}`}</style>
                </Head>
                {/*<body id="kt_body" className="header-fixed header-mobile-fixed subheader-enabled subheader-fixed aside-enabled aside-fixed aside-minimize-hoverable">*/}
                <body>
                    <Main/>
                    <NextScript/>
                    <script
                        dangerouslySetInnerHTML={{__html: `var KTAppSettings = { "breakpoints": { "sm": 576, "md": 768, "lg": 992, "xl": 1200, "xxl": 1200 }, "colors": { "theme": { "base": { "white": "#ffffff", "primary": "#3699FF", "secondary": "#E5EAEE", "success": "#1BC5BD", "info": "#8950FC", "warning": "#FFA800", "danger": "#F64E60", "light": "#F3F6F9", "dark": "#212121" }, "light": { "white": "#ffffff", "primary": "#E1F0FF", "secondary": "#ECF0F3", "success": "#C9F7F5", "info": "#EEE5FF", "warning": "#FFF4DE", "danger": "#FFE2E5", "light": "#F3F6F9", "dark": "#D6D6E0" }, "inverse": { "white": "#ffffff", "primary": "#ffffff", "secondary": "#212121", "success": "#ffffff", "info": "#ffffff", "warning": "#ffffff", "danger": "#ffffff", "light": "#464E5F", "dark": "#ffffff" } }, "gray": { "gray-100": "#F3F6F9", "gray-200": "#ECF0F3", "gray-300": "#E5EAEE", "gray-400": "#D6D6E0", "gray-500": "#B5B5C3", "gray-600": "#80808F", "gray-700": "#464E5F", "gray-800": "#1B283F", "gray-900": "#212121" } }, "font-family": "Poppins" };`}}/>
                    <script src="/assets/plugins/global/plugins.bundle.js?v=7.0.4"></script>
                    <script src="/assets/plugins/custom/prismjs/prismjs.bundle.js?v=7.0.4"></script>
                    <script src="/assets/js/scripts.bundle.js?v=7.0.4"></script>
                </body>
            </Html>
        );
    }
}

export default Document;