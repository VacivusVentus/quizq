import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';

interface QuizQuestion {
  text: string;
  options: string[];
  answer: string[];
}

interface VVQuize {
  theme: string;
  questions: QuizQuestion[];
}

interface QuestionPacketed {
  question: number;
  options: number[];
  answers: number[];
}

// Добавляем поле lang в итоговую структуру
interface PackedResult {
  theme: string;
  lang: string; // <-- Язык пакета (например, 'ru', 'en')
  questionsDictionary: string[];
  optionsDictionary: string[];
  packets: QuestionPacketed[];
}

function getIndexes(arr: string[], targetItems: string[]): number[] {
  return targetItems.map(item => arr.indexOf(item));
}

// Передаем lang внутрь функции упаковки
async function packit(content: VVQuize, lang: string): Promise<PackedResult> {
  const questionsDict: string[] = []; 
  const optionsDict: string[] = [];

  const packets = content.questions.map(q => {
    if (!questionsDict.includes(q.text)) {
      questionsDict.push(q.text);
    }
    const questIdx = questionsDict.indexOf(q.text);
    
    [...q.options, ...q.answer].forEach(opt => {
      if (!optionsDict.includes(opt)) {
        optionsDict.push(opt);
      }
    });

    return {
      question: questIdx,
      answers: getIndexes(optionsDict, q.answer)
    };
  });

  return {
    theme: content.theme,
    lang, // Сохраняем язык внутри JSON
    questionsDictionary: questionsDict,
    optionsDictionary: optionsDict,
    packets
  };
} 

const outputDir = './dist_data';
await mkdir(outputDir, { recursive: true });

const locals = await readdir('./data', { withFileTypes: true });

// Создаем карту-манифест, чтобы приложение знало, какой UUID какому языку принадлежит
const manifest: Record<string, Array<{ id: string; theme: string }>> = {};

for (const element of locals) {
  if (element.isDirectory()) {
    // Предполагаем, что название папки в ./data — это код языка (например, 'ru', 'en', 'es')
    // Если у вас другая структура папок, этот параметр можно брать из свойства внутри JSON
    const lang = element.name.toLowerCase(); 
    
    const locdir = `./data/${element.name}`;
    const files = await readdir(locdir, { withFileTypes: true });
    
    if (!manifest[lang]) {
      manifest[lang] = [];
    }
    
    for (const item of files) {
      if (item.isFile() && item.name.endsWith('.json')) {
        try {
          const filePath = path.join(locdir, item.name);
          const rawContent = await readFile(filePath, 'utf-8');
          const content = JSON.parse(rawContent) as VVQuize; 
          
          const packedData = await packit(content, lang); 
          
          const fileUuid = randomUUID();
          
          // Вариант А: Сохраняем в корневую папку, а язык пишем в имя: "ru-uuid.json"
          // Вариант Б: Складываем в подпапки dist_data/ru/uuid.json (выбран ниже)
          const langOutputDir = path.join(outputDir);
          await mkdir(langOutputDir, { recursive: true });
          
          const outputFilePath = path.join(langOutputDir, `${fileUuid}.json`);
          await writeFile(outputFilePath, JSON.stringify(packedData, null, 2), 'utf-8');
          
          // Добавляем запись в общий манифест
          manifest[lang].push({
            id: fileUuid,
            theme: content.theme
          });
          
          console.log(`✅ [${lang.toUpperCase()}] Успешно: ${item.name} -> ${lang}/${fileUuid}.json`);
        } catch (err) {
          console.error(`❌ Ошибка файла ${item.name}:`, err);
        }
      }
    }
  }
}

// Записываем файл манифеста, чтобы фронтенд мог запросить список тестов для нужного языка
await writeFile(
  path.join(outputDir, 'manifest.json'), 
  JSON.stringify(manifest, null, 2), 
  'utf-8'
);
console.log('📦 Манифест успешно создан в dist_data/manifest.json');
