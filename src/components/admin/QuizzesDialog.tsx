import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { BookOpen, Plus, Trash2 } from "lucide-react";
import type { QuizQuestion, Lesson } from "./types";

export function QuizzesDialog({ lesson }: { lesson: Lesson }) {
  const [quizzes, setQuizzes] = useState<QuizQuestion[]>([]);
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);

  const load = async () => {
    const { data } = await supabase
      .from("lesson_quizzes")
      .select("*")
      .eq("lesson_id", lesson.id)
      .order("position");
    setQuizzes((data ?? []) as QuizQuestion[]);
  };

  const add = async () => {
    if (!question.trim() || options.some((o) => !o.trim()))
      return toast.error("Preenche a pergunta e todas as opções.");
    const next = quizzes.length ? Math.max(...quizzes.map((q) => q.position)) + 1 : 1;
    const { error } = await supabase.from("lesson_quizzes").insert({
      lesson_id: lesson.id,
      question: question.trim(),
      options,
      correct_index: correctIndex,
      position: next,
    });
    if (error) return toast.error(error.message);
    toast.success("Pergunta adicionada");
    setQuestion("");
    setOptions(["", "", "", ""]);
    setCorrectIndex(0);
    load();
  };

  const remove = async (q: QuizQuestion) => {
    const { error } = await supabase.from("lesson_quizzes").delete().eq("id", q.id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) load();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <BookOpen className="mr-1 h-4 w-4" /> Quizzes
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Quizzes — {lesson.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2 rounded-lg border p-4">
            <h3 className="text-sm font-semibold">Nova pergunta</h3>
            <div className="space-y-2">
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Pergunta..."
              />
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correct"
                    checked={correctIndex === i}
                    onChange={() => setCorrectIndex(i)}
                    className="shrink-0"
                  />
                  <Input
                    value={opt}
                    onChange={(e) => {
                      const n = [...options];
                      n[i] = e.target.value;
                      setOptions(n);
                    }}
                    placeholder={`Opção ${i + 1}`}
                  />
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                Seleciona o rádio ao lado da opção correta.
              </p>
            </div>
            <Button size="sm" onClick={add} className="mt-2">
              <Plus className="mr-1 h-4 w-4" />
              Adicionar
            </Button>
          </div>
          {quizzes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma pergunta ainda.</p>
          ) : (
            <ul className="space-y-2">
              {quizzes.map((q) => (
                <li key={q.id} className="rounded-lg bg-secondary p-3 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium">{q.question}</p>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 shrink-0"
                      onClick={() => remove(q)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <ul className="mt-1 space-y-0.5 text-muted-foreground">
                    {(q.options as string[]).map((opt, i) => (
                      <li
                        key={i}
                        className={i === q.correct_index ? "font-medium text-green-600" : ""}
                      >
                        {i === q.correct_index ? "✓ " : ""}
                        {opt}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
