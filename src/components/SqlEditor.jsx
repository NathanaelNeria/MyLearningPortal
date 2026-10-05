import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { keymap } from '@codemirror/view';

export default function SqlEditor({ value, onChange, onRun, height = '220px' }) {
  const runKeymap = keymap.of([
    {
      key: 'Ctrl-Enter',
      mac: 'Cmd-Enter',
      run: () => {
        onRun?.();
        return true;
      },
    },
  ]);

  return (
    <div className="rounded-xl overflow-hidden border border-ink-800 shadow-sm h-full min-h-0">
      <CodeMirror
        value={value}
        height={height}
        theme="dark"
        extensions={[sql(), runKeymap]}
        onChange={onChange}
        basicSetup={{ lineNumbers: true, foldGutter: false, highlightActiveLine: true }}
        style={{ height: '100%' }}
      />
    </div>
  );
}
