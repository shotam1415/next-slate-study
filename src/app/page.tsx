"use client";
import React, { useState, useCallback ,useMemo} from "react";
import { Slate, Editable, withReact ,ReactEditor} from "slate-react";
import { BaseEditor, createEditor ,Editor,Transforms} from "slate";

type CustomElement = { type: "paragraph" | "code"|'line'|'italic'|null; children: CustomText[] };
type CustomText = { text: string , bold?:boolean };

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

export default function Home() {
  const [editor] = useState(() => withReact(createEditor()))

  //初期値を設定。ローカルストレージが存在時は初期値差し替え
  const initialValue = useMemo(
    () =>
      JSON.parse(localStorage.getItem('content')||'null') || [
        {
          type: 'paragraph',
          children: [{ text: 'A line of text in a paragraph.' }],
        },
      ],
    []
  )


const CustomEditor = {

  //太字判定
  isBoldMarkActive(editor:any) {
    const marks = Editor.marks(editor)
    return marks ? marks.bold === true : false
  },

  //テキストに太字のstyleを付与
  toggleBoldMark(editor:any) {
    const isActive = CustomEditor.isBoldMarkActive(editor)
    if (isActive) {
      Editor.removeMark(editor, 'bold')
    } else {
      Editor.addMark(editor, 'bold', true)
    }
  },

  //code判定
  isCodeBlockActive(editor:any) {
    const [match] = Editor.nodes(editor, {
      match: (n:any) => n.type === 'code',
    })
    return !!match
  },

  //判定後、codeのフラグをHTMLに付与
  toggleCodeBlock(editor:any) {
    const isActive = CustomEditor.isCodeBlockActive(editor)
    Transforms.setNodes(
      editor,
      { type: isActive ? null : 'code' },
      // { match: n => Editor.isBlock(editor, n) } memo:チュートリアルにあるが、入れると発火しないのでコメントアウト
    )
  },

    //line判定
    isLineBlockActive(editor:any) {
      const [match] = Editor.nodes(editor, {
        match: (n:any) => n.type === 'line',
      })
      return !!match
    },
  
    //判定後、lineのフラグをHTMLに付与
    toggleLineBlock(editor:any) {
      const isActive = CustomEditor.isLineBlockActive(editor)
      Transforms.setNodes(
        editor,
        { type: isActive ? null : 'line' },
      )
    },

    //line判定
    isItalicBlockActive(editor:any) {
      const [match] = Editor.nodes(editor, {
        match: (n:any) => n.type === 'italic',
      })
      return !!match
    },
      
    //判定後、lineのフラグをHTMLに付与
    toggleItalicBlock(editor:any) {
    const isActive = CustomEditor.isItalicBlockActive(editor)
    Transforms.setNodes(
      editor,
      { type: isActive ? null : 'italic' },
      )
    },
}

// 複数テキストをエレメント単位にしてコンポーネント分岐
const renderElement = useCallback((props:any) => {
  switch (props.element.type) {
    case 'italic':
      return <ItalicElement {...props} />
    case 'line':
      return <LineElement {...props} />
    case 'code':
      return <CodeElement {...props} />
    default:
      return <DefaultElement {...props} />
  }
}, [])

// 1文字単位のテキストをコンポーネント分岐
const renderLeaf = useCallback((props: any) => {
  return <Leaf {...props} />;
}, []);

  return (
    <main className="grid place-items-center h-screen">
      <div className="w-full">
        <div className="flex gap-8 mb-8 justify-center max-w-lg mx-auto rounded-lg p-2">
            <button
              onMouseDown={event => {
                event.preventDefault()
                CustomEditor.toggleBoldMark(editor)
              }}
            >
              <img className="w-full max-w-[40px]" src="/icon_bold.png" alt="" />
            </button>
            <button
              onMouseDown={event => {
                event.preventDefault()
                CustomEditor.toggleLineBlock(editor)
              }}
            >
              <img className="w-full max-w-[40px]" src="/icon_under.png" alt="" />
            </button>
            <button
              onMouseDown={event => {
                event.preventDefault()
                CustomEditor.toggleItalicBlock(editor)
              }}
            >
              <img className="w-full max-w-[40px]" src="/icon_italic.png" alt="" />
            </button>
            <button
              onMouseDown={event => {
                event.preventDefault()
                CustomEditor.toggleCodeBlock(editor)
              }}
            >
              <img className="w-full max-w-[40px]" src="/icon_code.png" alt="" />
            </button>
        </div>
        <Slate editor={editor} initialValue={initialValue} onChange={value => {
          const isAstChange = editor.operations.some(
            op => 'set_selection' !== op.type
          )
          if (isAstChange) {
            const content = JSON.stringify(value)
            localStorage.setItem('content', content)
          }
        }}>

          <Editable
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            className="border-2 min-h-[200px] max-w-lg mx-auto rounded-lg"
            onKeyDown={event => {
              // コントロールボタン＋何かのボタンを押して発火
              if (!event.ctrlKey) {
                return
              }

              switch (event.key) {
                case '`': {
                  event.preventDefault()
                  CustomEditor.toggleCodeBlock(editor)
                  break
                }

                case 'b': {
                  event.preventDefault()
                  CustomEditor.toggleBoldMark(editor)
                  break
                }
              }
            }}
          />
        </Slate>
      </div>
    </main>
  );
}



// ノーマルのラッパー
const DefaultElement = (props: any) => {
  return <p {...props.attributes}>{props.children}</p>;
};

//codeのラッパー
const CodeElement = (props: any) => {
  return (
    <pre {...props.attributes}>
      <code>{props.children}</code>
    </pre>
  );
};

//lineのラッパー
const LineElement = (props: any) => {
  return (
    <pre {...props.attributes}>
      <span className=" underline">{props.children}</span>
    </pre>
  );
};

//italicのラッパー
const ItalicElement = (props: any) => {
  return (
    <pre {...props.attributes}>
      <span className="italic">{props.children}</span>
    </pre>
  );
};

//太字のラッパー
const Leaf = (props: any) => {
  return (
    <span
      {...props.attributes}
      style={{ fontWeight: props.leaf.bold ? "bold" : "normal" }}
    >
      {props.children}
    </span>
  );
};
