import { User, NewsItem, Checklist, Task, DocumentItem, Product, ChatMessage } from '../types';

export const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Алексей Смирнов',
    role: 'EMPLOYEE',
    department: 'Продажи',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop'
  },
  {
    id: '2',
    name: 'Мария Иванова',
    role: 'MANAGER',
    department: 'HR',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
  },
  {
    id: '3',
    name: 'Дмитрий Волков',
    role: 'EMPLOYEE',
    department: 'IT',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop'
  },
];

export const MOCK_NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'Ежегодный корпоратив',
    description: 'Присоединяйтесь к нам на выходных для тимбилдинга.',
    content: 'Мы рады сообщить, что ежегодный выезд состоится в эти выходные! Нас ждет база отдыха "Солнечная", командные игры, барбекю и вечерняя программа. Сбор у офиса в 9:00.',
    date: '24 Окт 2023',
    imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80'
  },
  {
    id: '2',
    title: 'Новые льготы ДМС',
    description: 'Мы обновили планы медицинского страхования.',
    content: 'В новый пакет ДМС теперь включена стоматология полного цикла. Ознакомьтесь с подробностями в разделе "Документы" или обратитесь в HR-отдел.',
    date: '20 Окт 2023'
  },
];

export const MOCK_CHECKLISTS: Checklist[] = [
  {
    id: '1',
    title: 'Открытие смены',
    items: [
      { id: '1', text: 'Включить свет', isCompleted: true },
      { id: '2', text: 'Проверить инвентарь', isCompleted: false },
      { id: '3', text: 'Запустить сервер', isCompleted: false }
    ]
  },
  {
    id: '2',
    title: 'Техника безопасности',
    items: [
      { id: '1', text: 'Надеть защитную форму', isCompleted: true },
      { id: '2', text: 'Проверить выходы', isCompleted: true }
    ]
  },
];

export const MOCK_TASKS: Task[] = [
  {
    id: '1',
    title: 'Подготовить отчет',
    deadline: '25.10.2023',
    createdAt: '20.10.2023',
    status: 'IN_PROGRESS',
    description: 'Собрать данные о продажах по всем регионам за квартал. Проверить сводные таблицы.',
    assigneeId: '1',
    assigneeAvatar: MOCK_USERS[0].avatar,
    attachments: [
      { name: 'Шаблон отчета.xlsx', url: '#', type: 'file' },
      { name: 'Пример.png', url: '#', type: 'image' }
    ],
    history: [
      { date: '20.10.2023 10:00', action: 'Задача создана', author: 'Мария Иванова' },
      { date: '21.10.2023 14:30', action: 'Статус изменен на "В работе"', author: 'Алексей Смирнов' }
    ]
  },
  {
    id: '2',
    title: 'Онбординг клиента',
    deadline: '22.10.2023',
    createdAt: '18.10.2023',
    status: 'DONE',
    description: 'Приветственный набор отправлен в ООО "Вектор".',
    assigneeId: '3',
    assigneeAvatar: MOCK_USERS[2].avatar,
    history: [
      { date: '18.10.2023 09:15', action: 'Задача создана', author: 'Мария Иванова' },
      { date: '22.10.2023 11:00', action: 'Задача выполнена', author: 'Дмитрий Волков' }
    ]
  },
];

export const MOCK_DOCS: DocumentItem[] = [
  { id: '1', title: 'Трудовой договор', type: 'PDF', date: 'Янв 2023' },
  { id: '2', title: 'План офиса', type: 'IMAGE', date: 'Мар 2023' },
  { id: '3', title: 'Кодекс поведения', type: 'DOC', date: 'Янв 2023' },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Худи с логотипом',
    category: 'Одежда',
    price: '500 Баллов',
    description: 'Качественное хлопковое худи с логотипом компании.',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400'
  },
  {
    id: '2',
    name: 'Планер',
    category: 'Канцелярия',
    price: '120 Баллов',
    description: 'Кожаный блокнот формата А5.',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400'
  },
  {
    id: '3',
    name: 'Тренинг: Продажи',
    category: 'Обучение',
    price: 'Бесплатно',
    description: 'Продвинутый видеокурс.',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400'
  },
];

export const MOCK_CHAT: ChatMessage[] = [
  {
    id: '1',
    sender: 'Мария Иванова',
    text: 'Коллеги, доброе утро! Не забудьте про отчет.',
    timestamp: '9:00',
    isMe: false,
    avatar: MOCK_USERS[1].avatar
  },
  {
    id: '2',
    sender: 'Я',
    text: 'Доброе, уже в работе.',
    timestamp: '9:05',
    isMe: true,
    avatar: MOCK_USERS[0].avatar
  },
];
