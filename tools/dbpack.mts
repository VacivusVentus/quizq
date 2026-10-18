import { readdir, readFile } from 'node:fs/promises'; // Добавили readFile

interface QuizQuestion {
  /** Текст самого вопроса */
  text: string;
  
  /** Массив доступных вариантов ответов */
  options: string[];
  
  /** Массив правильных ответов (поддерживает один или несколько ответов) */
  answer: string[];
}

interface VVQuize {
  theme: string,
  questions: QuizQuestion[]
}

const locals = await readdir('./data', { withFileTypes: true });

await Promise.all(locals.map(async element => {
    if (element.isDirectory()) {
        console.log(`Папка: ${element.name}`);
        
        const locdir = `./data/${element.name}`;
        const files = await readdir(locdir, { withFileTypes: true }); // Тоже проверяем на файлы
        
        // Используем for...of вместо forEach для корректной работы await
        for (const item of files) {
            if (item.isFile()) {
                console.log(`Файл: ${item.name}`);
                
                const filePath = `${locdir}/${item.name}`;
                
                // Читаем локальный файл вместо fetch
                const content = JSON.parse(await readFile(filePath, 'utf-8')) as VVQuize; 
                console.log(content.theme, content.questions.length);
                
            }
        }
    } else {
        console.log(`Пропущен файл в корне: ${element.name}`);
    }
}));
