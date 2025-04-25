import TiptapImage from '@tiptap/extension-image';
import React from 'react';

export const CustomImage = TiptapImage.extend({
    addAttributes() {
      return {
        src: { default: null }, alt: { default: null }, title: { default: null },
        width: { default: null, parseHTML: element => element.style.width?.replace('px', '') || element.getAttribute('width') },
        height: { default: null, parseHTML: element => element.style.height?.replace('px', '') || element.getAttribute('height') },
        marginLeft: { default: null, parseHTML: element => element.style.marginLeft?.replace('px', '') },
        marginRight: { default: null, parseHTML: element => element.style.marginRight?.replace('px', '') },
      };
    },
    renderHTML({ HTMLAttributes }) {
        console.log('--- renderHTML called (margin-left/right) ---');
        console.log('Received HTMLAttributes:', HTMLAttributes);

        const { width, height, marginLeft, marginRight, ...restAttrs } = HTMLAttributes;
        const outputAttrs: Record<string, any> = { ...restAttrs };
        const styleObject: React.CSSProperties = {};

        if (width) outputAttrs.width = width;
        if (height) outputAttrs.height = height;

        if (marginLeft !== null && marginLeft !== undefined && marginLeft !== '') {
             const marginLeftNum = parseInt(marginLeft as string, 10);
             if (!isNaN(marginLeftNum) && marginLeftNum >= 0) {
                 styleObject.marginLeft = `${marginLeftNum}px`;
             }
        }
        if (marginRight !== null && marginRight !== undefined && marginRight !== '') {
             const marginRightNum = parseInt(marginRight as string, 10);
             if (!isNaN(marginRightNum) && marginRightNum >= 0) {
                 styleObject.marginRight = `${marginRightNum}px`;
             }
        }

        const styleString = Object.entries(styleObject)
            .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}:${value}`)
            .join(';');

        if (styleString) {
             outputAttrs.style = styleString;
        }

        outputAttrs.class = `tiptap-image ${outputAttrs.class || ''}`.trim();

        console.log('Returning attributes (with margin-left/right style):', outputAttrs);

        return ['img', outputAttrs];
    },
});

// 다른 공통 확장 기능이 있다면 여기에 추가 가능 