<script>
// import CharacterCount from '@tiptap/extension-character-count'
// import Subscript from '@tiptap/extension-subscript'
// import Superscript from '@tiptap/extension-superscript'
// import TextAlign from '@tiptap/extension-text-align'
// import Underline from '@tiptap/extension-underline'
// import StarterKit from '@tiptap/starter-kit'
// import { Editor, EditorContent } from '@tiptap/vue-3'

export default {
  // components: { EditorContent },
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    maxLimit: {
      type: Number,
      default: null,
    },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      editor: null,
      textActions: [
        {
          slug: 'bold',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-type-bold" viewBox="0 0 16 16">
  <path d="M8.21 13c2.106 0 3.412-1.087 3.412-2.823 0-1.306-.984-2.283-2.324-2.386v-.055a2.176 2.176 0 0 0 1.852-2.14c0-1.51-1.162-2.46-3.014-2.46H3.843V13H8.21zM5.908 4.674h1.696c.963 0 1.517.451 1.517 1.244 0 .834-.629 1.32-1.73 1.32H5.908V4.673zm0 6.788V8.598h1.73c1.217 0 1.88.492 1.88 1.415 0 .943-.643 1.449-1.832 1.449H5.907z"/>
</svg>`,
          active: 'bold',
        },
        {
          slug: 'italic',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-type-italic" viewBox="0 0 16 16">
  <path d="M7.991 11.674 9.53 4.455c.123-.595.246-.71 1.347-.807l.11-.52H7.211l-.11.52c1.06.096 1.128.212 1.005.807L6.57 11.674c-.123.595-.246.71-1.346.806l-.11.52h3.774l.11-.52c-1.06-.095-1.129-.211-1.006-.806z"/>
</svg>`,
          active: 'italic',
        },
        {
          slug: 'underline',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-type-underline" viewBox="0 0 16 16">
  <path d="M5.313 3.136h-1.23V9.54c0 2.105 1.47 3.623 3.917 3.623s3.917-1.518 3.917-3.623V3.136h-1.23v6.323c0 1.49-.978 2.57-2.687 2.57-1.709 0-2.687-1.08-2.687-2.57V3.136zM12.5 15h-9v-1h9v1z"/>
</svg>`,
          active: 'underline',
        },
        {
          slug: 'strike',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-type-strikethrough" viewBox="0 0 16 16">
  <path d="M6.333 5.686c0 .31.083.581.27.814H5.166a2.776 2.776 0 0 1-.099-.76c0-1.627 1.436-2.768 3.48-2.768 1.969 0 3.39 1.175 3.445 2.85h-1.23c-.11-1.08-.964-1.743-2.25-1.743-1.23 0-2.18.602-2.18 1.607zm2.194 7.478c-2.153 0-3.589-1.107-3.705-2.81h1.23c.144 1.06 1.129 1.703 2.544 1.703 1.34 0 2.31-.705 2.31-1.675 0-.827-.547-1.374-1.914-1.675L8.046 8.5H1v-1h14v1h-3.504c.468.437.675.994.675 1.697 0 1.826-1.436 2.967-3.644 2.967z"/>
</svg>`,
          active: 'strike',
        },
        {
          slug: 'align',
          option: 'left',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-align-start" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M1.5 1a.5.5 0 0 1 .5.5v13a.5.5 0 0 1-1 0v-13a.5.5 0 0 1 .5-.5z"/>
  <path d="M3 7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7z"/>
</svg>`,
          active: { textAlign: 'left' },
        },
        {
          slug: 'align',
          option: 'center',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-align-center" viewBox="0 0 16 16">
  <path d="M8 1a.5.5 0 0 1 .5.5V6h-1V1.5A.5.5 0 0 1 8 1zm0 14a.5.5 0 0 1-.5-.5V10h1v4.5a.5.5 0 0 1-.5.5zM2 7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7z"/>
</svg>`,
          active: { textAlign: 'center' },
        },
        {
          slug: 'align',
          option: 'right',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-align-end" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M14.5 1a.5.5 0 0 0-.5.5v13a.5.5 0 0 0 1 0v-13a.5.5 0 0 0-.5-.5z"/>
  <path d="M13 7a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7z"/>
</svg>`,
          active: { textAlign: 'right' },
        },
        {
          slug: 'align',
          option: 'justify',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-justify" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M2 12.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/>
</svg>`,
          active: { textAlign: 'justify' },
        },
        {
          slug: 'bulletList',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-list" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
</svg>`,
          active: 'bulletList',
        },
        {
          slug: 'orderedList',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-list-ol" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5z"/>
  <path d="M1.713 11.865v-.474H2c.217 0 .363-.137.363-.317 0-.185-.158-.31-.361-.31-.223 0-.367.152-.373.31h-.59c.016-.467.373-.787.986-.787.588-.002.954.291.957.703a.595.595 0 0 1-.492.594v.033a.615.615 0 0 1 .569.631c.003.533-.502.8-1.051.8-.656 0-1-.37-1.008-.794h.582c.008.178.186.306.422.309.254 0 .424-.145.422-.35-.002-.195-.155-.348-.414-.348h-.3zm-.004-4.699h-.604v-.035c0-.408.295-.844.958-.844.583 0 .96.326.96.756 0 .389-.257.617-.476.848l-.537.572v.03h1.054V9H1.143v-.395l.957-.99c.138-.142.293-.304.293-.508 0-.18-.147-.32-.342-.32a.33.33 0 0 0-.342.338v.041zM2.564 5h-.635V2.924h-.031l-.598.42v-.567l.629-.443h.635V5z"/>
</svg>`,
          active: 'orderedList',
        },
        {
          slug: 'undo',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-counterclockwise" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z"/>
  <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z"/>
</svg>`,
          active: 'undo',
        },
        {
          slug: 'redo',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-clockwise" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
  <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
</svg>`,
          active: 'redo',
        },
        {
          slug: 'clear',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <g>
        <path fill="none" d="M0 0h24v24H0z"></path>
        <path d="M12.651 14.065L11.605 20H9.574l1.35-7.661-7.41-7.41L4.93 3.515 20.485 19.07l-1.414 1.414-6.42-6.42zm-.878-6.535l.27-1.53h-1.8l-2-2H20v2h-5.927L13.5 9.257 11.773 7.53z"></path>
    </g>
</svg>`,
          active: 'clear',
        },
      ],
    }
  },
  computed: {
    charactersCount() {
      return this.editor.storage.characterCount.characters()
    },
    wordsCount() {
      return this.editor.storage.characterCount.words()
    },
    limitWarning() {
      const isCloseToMax = this.charactersCount >= this.maxLimit - 20
      const isMax = this.charactersCount === this.maxLimit

      if (isCloseToMax && !isMax) {
        return 'warning'
      }

      if (isMax) {
        return 'danger'
      }

      return ''
    },
  },
  watch: {
    modelValue(value) {
      if (this.editor.getHTML() === value) {
        return
      }

      this.editor.commands.setContent(this.modelValue, false)
    },
  },
  mounted() {
    // this.editor = new Editor({
    //   content: this.modelValue,
    //   extensions: [
    //     StarterKit,
    //     Underline,
    //     Subscript,
    //     Superscript,
    //     CharacterCount.configure({ limit: this.maxLimit }),
    //     TextAlign.configure({ types: ['heading', 'paragraph'] }),
    //   ],
    //   onUpdate: () => {
    //     this.$emit('update:modelValue', this.editor.getHTML())
    //   },
    // })
  },
  beforeUnmount() {
    this.editor.destroy()
  },
  methods: {
    onActionClick(slug, option = null) {
      const vm = this.editor.chain().focus()
      const actionTriggers = {
        bold: () => vm.toggleBold().run(),
        italic: () => vm.toggleItalic().run(),
        underline: () => vm.toggleUnderline().run(),
        strike: () => vm.toggleStrike().run(),
        bulletList: () => vm.toggleBulletList().run(),
        orderedList: () => vm.toggleOrderedList().run(),
        align: () => vm.setTextAlign(option).run(),
        subscript: () => vm.toggleSubscript().run(),
        superscript: () => vm.toggleSuperscript().run(),
        undo: () => vm.undo().run(),
        redo: () => vm.redo().run(),
        clear: () => {
          vm.clearNodes().run()
          vm.unsetAllMarks().run()
        },
      }

      actionTriggers[slug]()
    },
    onHeadingClick(index) {
      const vm = this.editor.chain().focus()

      vm.toggleHeading({ level: index }).run()
    },
  },
}
</script>

<template>
  <div id="text-editor">
    <div v-if="editor" class="toolbar">
      <div class="align-dropdown">
        <button class="dropbtn">Heading ▼</button>
        <div class="dropdown-content">
          <a
            v-for="index in 6"
            :key="index"
            :class="{ active: editor.isActive('heading', { level: index }) }"
            :style="{ fontSize: 20 - index + 'px' }"
            role="button"
            @click="onHeadingClick(index)"
          >
            H{{ index }}
          </a>
        </div>
      </div>

      <button
        v-for="({ slug, option, active, icon }, index) in textActions"
        :key="index"
        type="button"
        :class="{ active: editor.isActive(active) }"
        @click="onActionClick(slug, option)"
        v-html="icon"
      />
    </div>

    <!-- <EditorContent class="text-editor__content" :editor="editor" /> -->

    <div v-if="editor" class="footer">
      <span class="characters-count" :class="maxLimit ? limitWarning : ''">
        {{ charactersCount }} {{ maxLimit ? `/ ${maxLimit} characters` : 'characters' }}
      </span>
      |
      <span class="words-count"> {{ wordsCount }} words </span>
    </div>
  </div>
</template>

<style scoped>
#text-editor {
  display: grid;
  grid-template-rows: min-content 1fr;

  height: 100%;

  border: 1px solid hsl(0deg 0% 50%);
}

.text-editor__content {
  display: grid;
}

.text-editor__content > div {
  height: 100%;
}

#text-editor .toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;

  border-bottom: 1px solid hsl(0deg 0% 50%);
}

#text-editor .toolbar > button {
  display: flex;
  justify-content: center;
  align-items: center;

  width: 32px;
  height: 32px;
  margin: 0.5em 4px;

  color: hsl(0deg 0% 20%);
  font-size: 20px;

  border: none;
  border-radius: 2px;

  background: hsl(0deg 0% 100%);

  cursor: pointer;

  appearance: none;
}

#text-editor .toolbar > button.active {
  color: hsl(0deg 0% 100%);

  background: hsl(0deg 0% 20%);
}

#text-editor .align-dropdown {
  position: relative;

  display: inline-block;

  margin: 0.5em 8px;
}

#text-editor .align-dropdown > button {
  height: 32px;

  color: hsl(0deg 0% 20%);

  border: none;
  border-radius: 2px;

  background: hsl(0deg 0% 100%);

  cursor: pointer;

  appearance: none;
}

#text-editor .align-dropdown > .dropdown-content {
  position: absolute;
  left: 0;
  right: 0;
  z-index: 1;

  display: none;

  border: 1px solid hsl(0deg 0% 20%);
  border-radius: 2px;

  background-color: hsl(0deg 0% 100%);

  outline: 1px solid hsl(0deg 0% 100%);
}

#text-editor .align-dropdown > .dropdown-content a {
  display: block;

  padding: 6px 12px;

  text-align: center;

  cursor: pointer;
}

#text-editor .align-dropdown > .dropdown-content a:hover,
#text-editor .align-dropdown > .dropdown-content a.active {
  color: hsl(0deg 0% 100%);

  background: hsl(0deg 0% 20%);
}

#text-editor .align-dropdown:hover .dropdown-content {
  display: block;
}

#text-editor .divider {
  width: 1px;
  height: 24px;
  margin-right: 6px;

  background: hsl(0deg 0% 20%);
}

#text-editor .footer {
  padding: 6px;

  color: hsl(0deg 0% 50%);
  font-size: 14px;
  text-align: right;
}

#text-editor .footer .characters-count.warning {
  color: orange;
}

#text-editor .footer .characters-count.danger {
  color: red;
}

#text-editor .ProseMirror {
  height: 300px;
  padding-right: 0.5em;
  padding-left: 0.5em;

  outline: none;

  overflow-y: auto;
}

#text-editor .ProseMirror > p:first-child {
  margin-top: 0.5em;
}

#text-editor .ProseMirror > h1:first-child,
#text-editor .ProseMirror h2:first-child,
#text-editor .ProseMirror h3:first-child,
#text-editor .ProseMirror h4:first-child,
#text-editor .ProseMirror h5:first-child,
#text-editor .ProseMirror h6:first-child {
  margin-top: 0.5em;
}
</style>
