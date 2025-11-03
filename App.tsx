import React, { useState, useEffect, createContext, useMemo } from 'react';
import { User, Role, Lecture, StudentAnswer, QuizFeedback } from './types';
import { generateQuiz, generateFeedback } from './services/geminiService';
import LoginPage from './components/LoginPage';
import RegistrationPage from './components/RegistrationPage';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';

// THEME
type Theme = 'light' | 'dark';
type ThemeContextType = { theme: Theme; toggleTheme: () => void; };
export const ThemeContext = createContext<ThemeContextType>({ theme: 'light', toggleTheme: () => {} });

// LANGUAGE
type Language = 'kk' | 'ru';

const translations: { [lang in Language]: { [key: string]: string } } = {
  kk: {
    signIn: 'Кіру',
    signUp: 'Тіркелу',
    loginWelcome: 'Аккаунтыңызға кіріңіз',
    emailPlaceholder: 'Электрондық пошта',
    passwordPlaceholder: 'Құпия сөз',
    invalidCredentials: 'Электрондық пошта немесе құпия сөз қате',
    noAccount: 'Аккаунтыңыз жоқ па?',
    createAccount: 'Жаңа аккаунт құру',
    fullNamePlaceholder: 'Толық аты-жөні',
    confirmPasswordPlaceholder: 'Құпия сөзді растаңыз',
    selectRole: 'Рөлді таңдаңыз',
    student: 'Студент',
    teacher: 'Мұғалім',
    passwordsDoNotMatch: 'Құпия сөздер сәйкес келмейді',
    registrationSuccess: 'Тіркеу сәтті аяқталды! Кіру бетіне қайта бағытталуда...',
    alreadyHaveAccount: 'Аккаунтыңыз бар ма?',
    teacherLoginHint: 'Мұғалім: mugalim@example.com / 12345678',
    studentLoginHint: 'Студент: student@example.com / 12345678',
    studentDashboardTitle: 'Студенттің бақылау тақтасы',
    teacherDashboardTitle: 'Мұғалімнің бақылау тақтасы',
    welcomeUser: 'Қош келдіңіз, {fullName}',
    logout: 'Шығу',
    chatbotTitle: 'AI көмекшісі',
    chatbotPlaceholder: 'Сұрағыңызды жазыңыз...',
    send: 'Жіберу',
    genericError: 'Бірдеңе дұрыс болмады. Кейінірек қайталап көріңіз.',
    selectCourse: 'Оқу курсын таңдаңыз',
    firstCourse: '1-курс',
    secondCourse: '2-курс',
    thirdCourse: '3-курс',
    fourthCourse: '4-курс',
    backToCourseSelection: 'Курстарды таңдауға оралу',
    courseworkTitle: 'Курстық жұмыстар',
    completed: 'Аяқталды',
    noLecturesForThisCourse: 'Бұл курс үшін дәрістер әлі жоқ.',
    backToLectureList: 'Дәрістер тізіміне оралу',
    enterAccessCode: 'Жалғастыру үшін кіру кодын енгізіңіз',
    accessCode: 'Кіру коды',
    submitCode: 'Кодты жіберу',
    invalidAccessCode: 'Кіру коды жарамсыз.',
    quizResults: 'Тест нәтижелері',
    yourAnswer: 'Сіздің жауабыңыз',
    correctAnswer: 'Дұрыс жауап',
    aiFeedback: 'AI кері байланысы',
    lectureInstructions: 'Дәрісті бастамас бұрын, төмендегі файлды жүктеп алып, мұқият оқып шығыңыз.',
    downloadLectureFile: 'Дәріс файлын жүктеу',
    startQuiz: 'Тестті бастау',
    quiz: 'Тест',
    question: 'Сұрақ',
    nextQuestion: 'Келесі сұрақ',
    submitQuiz: 'Тестті тапсыру',
    addLecture: 'Дәріс қосу',
    uploadLectureFile: 'Дәріс файлын жүктеңіз',
    uploadHint: 'PDF, DOCX, PPTX файлдарын осында сүйреп апарыңыз немесе таңдау үшін басыңыз',
    fileTypeError: '{fileType} файлдарына қолдау көрсетілмейді. DOCX немесе PPTX форматына түрлендіріңіз.',
    unsupportedFileType: 'Файл түріне қолдау көрсетілмейді.',
    processingFile: 'Файл өңделуде...',
    createLecture: 'Дәріс құру',
    lectureTitle: 'Дәріс тақырыбы',
    cancel: 'Болдырмау',
    save: 'Сақтау',
    lectureDetails: 'Дәріс туралы мәліметтер',
    accessCodeForStudents: 'Студенттерге арналған кіру коды:',
    quizQuestions: 'Тест сұрақтары',
    studentSubmissions: 'Студенттердің жұмыстары',
    noSubmissionsYet: 'Әзірге ешкім жұмыс тапсырған жоқ.',
    score: 'Ұпай',
    yourProfile: 'Сіздің профиліңіз',
    changePhoto: 'Фотосуретті өзгерту',
    deleteLecture: 'Дәрісті жою',
    deleteConfirmation: 'Сіз бұл дәрісті біржола жойғыңыз келетініне сенімдісіз бе?',
    updatePassword: 'Құпия сөзді жаңарту',
    currentPassword: 'Ағымдағы құпия сөз',
    newPassword: 'Жаңа құпия сөз',
    confirmNewPassword: 'Жаңа құпия сөзді растаңыз',
    passwordUpdateSuccess: 'Құпия сөз сәтті жаңартылды!',
    passwordMismatchError: 'Жаңа құпия сөздер сәйкес келмейді.',
    incorrectCurrentPassword: 'Ағымдағы құпия сөз қате.',
    fillAllPasswordFields: 'Құпия сөзді өзгерту үшін барлық өрістерді толтырыңыз.',
    userExistsError: 'Бұл электрондық поштамен пайдаланушы тіркелген.',
  },
  ru: {
    signIn: 'Войти',
    signUp: 'Регистрация',
    loginWelcome: 'Войдите в свой аккаунт',
    emailPlaceholder: 'Электронная почта',
    passwordPlaceholder: 'Пароль',
    invalidCredentials: 'Неверный email или пароль',
    noAccount: 'Нет аккаунта?',
    createAccount: 'Создать новый аккаунт',
    fullNamePlaceholder: 'Полное имя',
    confirmPasswordPlaceholder: 'Подтвердите пароль',
    selectRole: 'Выберите роль',
    student: 'Студент',
    teacher: 'Преподаватель',
    passwordsDoNotMatch: 'Пароли не совпадают',
    registrationSuccess: 'Регистрация прошла успешно! Перенаправление на страницу входа...',
    alreadyHaveAccount: 'Уже есть аккаунт?',
    teacherLoginHint: 'Учитель: mugalim@example.com / 12345678',
    studentLoginHint: 'Студент: student@example.com / 12345678',
    studentDashboardTitle: 'Панель студента',
    teacherDashboardTitle: 'Панель преподавателя',
    welcomeUser: 'Добро пожаловать, {fullName}',
    logout: 'Выйти',
    chatbotTitle: 'AI помощник',
    chatbotPlaceholder: 'Напишите свой вопрос...',
    send: 'Отправить',
    genericError: 'Что-то пошло не так. Пожалуйста, попробуйте позже.',
    selectCourse: 'Выберите курс обучения',
    firstCourse: '1-й курс',
    secondCourse: '2-й курс',
    thirdCourse: '3-й курс',
    fourthCourse: '4-й курс',
    backToCourseSelection: 'Вернуться к выбору курса',
    courseworkTitle: 'Курсовые работы',
    completed: 'Завершено',
    noLecturesForThisCourse: 'Лекций для этого курса пока нет.',
    backToLectureList: 'Вернуться к списку лекций',
    enterAccessCode: 'Введите код доступа, чтобы продолжить',
    accessCode: 'Код доступа',
    submitCode: 'Отправить код',
    invalidAccessCode: 'Неверный код доступа.',
    quizResults: 'Результаты теста',
    yourAnswer: 'Ваш ответ',
    correctAnswer: 'Правильный ответ',
    aiFeedback: 'Обратная связь от AI',
    lectureInstructions: 'Перед началом лекции, пожалуйста, скачайте и внимательно изучите файл ниже.',
    downloadLectureFile: 'Скачать файл лекции',
    startQuiz: 'Начать тест',
    quiz: 'Тест',
    question: 'Вопрос',
    nextQuestion: 'Следующий вопрос',
    submitQuiz: 'Завершить тест',
    addLecture: 'Добавить лекцию',
    uploadLectureFile: 'Загрузите файл лекции',
    uploadHint: 'Перетащите файлы PDF, DOCX, PPTX сюда или нажмите для выбора',
    fileTypeError: 'Файлы {fileType} не поддерживаются. Пожалуйста, конвертируйте в .docx или .pptx.',
    unsupportedFileType: 'Тип файла не поддерживается.',
    processingFile: 'Обработка файла...',
    createLecture: 'Создать лекцию',
    lectureTitle: 'Название лекции',
    cancel: 'Отмена',
    save: 'Сохранить',
    lectureDetails: 'Детали лекции',
    accessCodeForStudents: 'Код доступа для студентов:',
    quizQuestions: 'Вопросы теста',
    studentSubmissions: 'Работы студентов',
    noSubmissionsYet: 'Пока что нет отправленных работ.',
    score: 'Балл',
    yourProfile: 'Ваш профиль',
    changePhoto: 'Сменить фото',
    deleteLecture: 'Удалить лекцию',
    deleteConfirmation: 'Вы уверены, что хотите навсегда удалить эту лекцию?',
    updatePassword: 'Обновить пароль',
    currentPassword: 'Текущий пароль',
    newPassword: 'Новый пароль',
    confirmNewPassword: 'Подтвердите новый пароль',
    passwordUpdateSuccess: 'Пароль успешно обновлен!',
    passwordMismatchError: 'Новые пароли не совпадают.',
    incorrectCurrentPassword: 'Неверный текущий пароль.',
    fillAllPasswordFields: 'Заполните все поля для смены пароля.',
    userExistsError: 'Пользователь с таким email уже существует.',
  }
};

type LanguageContextType = { language: Language; toggleLanguage: () => void; t: (key: string, vars?: {[key: string]: string}) => string; };
export const LanguageContext = createContext<LanguageContextType>({ language: 'kk', toggleLanguage: () => {}, t: () => '' });

const App: React.FC = () => {
    // states
    const [theme, setTheme] = useState<Theme>('light');
    const [language, setLanguage] = useState<Language>('kk');
    const [currentView, setCurrentView] = useState<'login' | 'register'>('login');

    const [users, setUsers] = useState<User[]>(() => {
        const savedUsers = localStorage.getItem('ai4cyber_users');
        if (savedUsers) return JSON.parse(savedUsers);
        return [
            { email: 'mugalim@example.com', password: '12345678', role: Role.TEACHER, fullName: 'Мұғалім Мұғалімов', profilePictureUrl: null },
            { email: 'student@example.com', password: '12345678', role: Role.STUDENT, fullName: 'Студент Студентов', profilePictureUrl: null },
        ];
    });

    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        const savedUser = localStorage.getItem('ai4cyber_currentUser');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [lectures, setLectures] = useState<Lecture[]>(() => {
        const savedLectures = localStorage.getItem('ai4cyber_lectures');
        return savedLectures ? JSON.parse(savedLectures) : [];
    });

    const [studentProgress, setStudentProgress] = useState<{ [lectureId: string]: { [studentEmail: string]: { answers: StudentAnswer[], feedback: QuizFeedback[] | null } } }>(() => {
        const savedProgress = localStorage.getItem('ai4cyber_studentProgress');
        return savedProgress ? JSON.parse(savedProgress) : {};
    });

    // effects
    useEffect(() => { document.documentElement.classList.toggle('dark', theme === 'dark'); }, [theme]);
    useEffect(() => { localStorage.setItem('ai4cyber_users', JSON.stringify(users)); }, [users]);
    useEffect(() => { localStorage.setItem('ai4cyber_currentUser', JSON.stringify(currentUser)); }, [currentUser]);
    useEffect(() => { localStorage.setItem('ai4cyber_lectures', JSON.stringify(lectures)); }, [lectures]);
    useEffect(() => { localStorage.setItem('ai4cyber_studentProgress', JSON.stringify(studentProgress)); }, [studentProgress]);


    // memos (providers values)
    const languageProviderValue = useMemo(() => {
        const t = (key: string, vars: {[key: string]: string} = {}) => {
            let translation = translations[language][key] || key;
            Object.keys(vars).forEach(varKey => {
                translation = translation.replace(`{${varKey}}`, vars[varKey]);
            });
            return translation;
        };
        return { language, toggleLanguage: () => setLanguage(language === 'kk' ? 'ru' : 'kk'), t };
    }, [language]);
    const themeProviderValue = useMemo(() => ({ theme, toggleTheme: () => setTheme(theme === 'light' ? 'dark' : 'light') }), [theme]);


    // handlers
    const handleLogin = (email: string, password: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            const user = users.find(u => u.email === email && u.password === password);
            if (user) {
                setCurrentUser(user);
                resolve();
            } else {
                reject(new Error(languageProviderValue.t('invalidCredentials')));
            }
        });
    };

    const handleRegister = (newUser: Omit<User, 'profilePictureUrl'>): Promise<void> => {
        return new Promise((resolve, reject) => {
            if (users.some(u => u.email === newUser.email)) {
                return reject(new Error(languageProviderValue.t('userExistsError')));
            }
            const userToSave: User = { ...newUser, profilePictureUrl: null };
            setUsers(prev => [...prev, userToSave]);
            resolve();
        });
    };

    const handleLogout = () => {
        setCurrentUser(null);
    };

    const handleShowRegister = () => setCurrentView('register');
    const handleShowLogin = () => setCurrentView('login');

    const handleUpdateProfilePicture = (file: File) => {
        if (currentUser) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64Url = event.target?.result as string;
                const updatedUser = { ...currentUser, profilePictureUrl: base64Url };
                setCurrentUser(updatedUser);
                setUsers(prevUsers => prevUsers.map(u => u.email === currentUser.email ? updatedUser : u));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdatePassword = (currentPassword: string, newPassword: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            if (!currentUser || currentUser.password !== currentPassword) {
                return reject(new Error(languageProviderValue.t('incorrectCurrentPassword')));
            }
            const updatedUser = { ...currentUser, password: newPassword };
            setCurrentUser(updatedUser);
            setUsers(prevUsers => prevUsers.map(u => u.email === currentUser.email ? updatedUser : u));
            resolve();
        });
    };
    
    const handleAddLecture = async (
        title: string,
        fileName: string,
        fileURL: string,
        fileType: string,
        textContent: string,
        course: string
    ): Promise<Lecture> => {
        const quizQuestions = await generateQuiz(textContent);
        const newLecture: Lecture = {
            id: `lec-${Date.now()}`,
            title,
            fileName,
            fileURL,
            fileType,
            textContent,
            course,
            accessCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
            quiz: quizQuestions,
            isPublished: true,
        };
        setLectures(prev => [...prev, newLecture]);
        return newLecture;
    };
    
     const handleDeleteLecture = (lectureId: string) => {
        setLectures(prev => prev.filter(l => l.id !== lectureId));
        setStudentProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[lectureId];
            return newProgress;
        });
    };

    const handleSubmitQuiz = async (lectureId: string, answers: StudentAnswer[]) => {
        if (!currentUser) return;
        const lecture = lectures.find(l => l.id === lectureId);
        if (!lecture || !lecture.quiz) return;

        const feedbackPromises: Promise<QuizFeedback | null>[] = answers
            .map((answer) => {
                const question = lecture.quiz![answer.questionIndex];
                if (answer.selectedAnswer !== question.correctAnswer) {
                    return generateFeedback(
                        lecture.textContent,
                        question.question,
                        answer.selectedAnswer,
                        question.correctAnswer
                    ).then(feedbackText => ({
                        questionIndex: answer.questionIndex,
                        feedbackText
                    }));
                }
                return Promise.resolve(null);
            });
        
        const feedbackResults = (await Promise.all(feedbackPromises)).filter((f): f is QuizFeedback => f !== null);

        setStudentProgress(prev => ({
            ...prev,
            [lectureId]: {
                ...prev[lectureId],
                [currentUser.email]: {
                    answers,
                    feedback: feedbackResults
                }
            }
        }));
    };

    // rendering logic
    if (!currentUser) {
        return (
            <LanguageContext.Provider value={languageProviderValue}>
                 <ThemeContext.Provider value={themeProviderValue}>
                    {currentView === 'login' ? (
                        <LoginPage onLogin={handleLogin} onShowRegister={handleShowRegister} />
                    ) : (
                        <RegistrationPage onRegister={handleRegister} onShowLogin={handleShowLogin} />
                    )}
                 </ThemeContext.Provider>
            </LanguageContext.Provider>
        );
    }

    const studentProgressForCurrentUser = Object.keys(studentProgress).reduce((acc, lectureId) => {
        if (studentProgress[lectureId][currentUser.email]) {
            acc[lectureId] = studentProgress[lectureId][currentUser.email];
        }
        return acc;
    }, {} as {[lectureId: string]: { answers: StudentAnswer[]; feedback: QuizFeedback[] | null; }});

    return (
        <LanguageContext.Provider value={languageProviderValue}>
            <ThemeContext.Provider value={themeProviderValue}>
                <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
                    {currentUser.role === Role.STUDENT ? (
                        <StudentDashboard 
                            user={currentUser} 
                            onLogout={handleLogout}
                            lectures={lectures.filter(l => l.isPublished)}
                            studentProgress={studentProgressForCurrentUser}
                            onSubmitQuiz={handleSubmitQuiz}
                            onUpdateProfilePicture={handleUpdateProfilePicture}
                            onUpdatePassword={handleUpdatePassword}
                        />
                    ) : (
                        <TeacherDashboard
                             user={currentUser} 
                             onLogout={handleLogout}
                             lectures={lectures}
                             studentProgress={studentProgress}
                             onAddLecture={handleAddLecture}
                             onUpdateProfilePicture={handleUpdateProfilePicture}
                             onUpdatePassword={handleUpdatePassword}
                             onDeleteLecture={handleDeleteLecture}
                        />
                    )}
                </div>
            {/* FIX: Corrected typo in ThemeContext closing tag */}
            </ThemeContext.Provider>
        </LanguageContext.Provider>
    );
};

export default App;