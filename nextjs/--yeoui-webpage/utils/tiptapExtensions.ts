import TiptapImage from '@tiptap/extension-image';
import React from 'react';
import { Node as ProsemirrorNode } from '@tiptap/pm/model';

console.log('[CustomImage Extension] File loaded and CustomImage is being defined NOW.');

export const CustomImage = TiptapImage.extend({
    addAttributes() {
      return {
        src: { default: null }, alt: { default: null }, title: { default: null },
        width: { default: null, parseHTML: element => element.style.width?.replace('px', '') || element.getAttribute('width') },
        height: { default: null, parseHTML: element => element.style.height?.replace('px', '') || element.getAttribute('height') },
        marginLeft: { default: null, parseHTML: element => element.style.marginLeft?.replace('px', '') },
        marginRight: { default: null, parseHTML: element => element.style.marginRight?.replace('px', '') },
        'data-src-type': { default: null },
        'data-original-name': { default: null },
      };
    },

    toDOM(node: ProsemirrorNode) {
        const { src, alt, title, width, height, marginLeft, marginRight, ...otherAttrs } = node.attrs as Record<string, any>;
        console.log('[CustomImage toDOM V5] START. Node attributes:', JSON.parse(JSON.stringify(node.attrs)));

        const attrs: Record<string, any> = { ...otherAttrs }; 
        if (src) attrs.src = src;
        if (alt) attrs.alt = alt;
        if (title) attrs.title = title;

        const styleObject: React.CSSProperties = {};

        if (width !== null && width !== undefined && width !== '') {
            const widthNum = parseInt(width as string, 10);
            if (!isNaN(widthNum) && widthNum > 0) {
                styleObject.width = `${widthNum}px`;
            }
        }

        if (height !== null && height !== undefined && height !== '') {
            const heightNum = parseInt(height as string, 10);
            if (!isNaN(heightNum) && heightNum > 0) {
                styleObject.height = `${heightNum}px`;
            } else {
                styleObject.height = 'auto';
            }
        } else {
            styleObject.height = 'auto';
        }

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
             attrs.style = styleString;
             console.log('[CustomImage toDOM V5] Final inline style string:', styleString);
        } else {
            console.log('[CustomImage toDOM V5] No styles generated for styleObject.');
        }

        attrs.class = `tiptap-image ${attrs.class || ''}`.trim();
        
        console.log('[CustomImage toDOM V5] END. Returning DOM spec:', ['img', attrs]);
        return ['img', attrs];
    }
    /* renderHTML 주석 처리 또는 삭제
    renderHTML({ HTMLAttributes, node }) { 
        // ... 이전 V3 로그 포함된 renderHTML 코드 ...
    },
    */
});

// 다른 공통 확장 기능이 있다면 여기에 추가 가능 