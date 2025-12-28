export const MOCK_THREADS = [
  {
    id: 'thread_1',
    contentType: 'voice',
    content: {
      duration: 45,
      audioUrl: null
    },
    title: 'Elden Ring DLC is absolutely incredible',
    category: 'gaming',
    tags: ['Elden Ring', 'RPG', 'FromSoft'],
    author: {
      id: 'user_1',
      name: 'SoulsVeteran',
      avatar: null
    },
    stats: {
      views: 234,
      agrees: 89,
      disagrees: 12,
      replies: 23
    },
    createdAt: Date.now() - 7200000,
    isTrending: true,
    replies: []
  },
  {
    id: 'thread_2',
    contentType: 'voice',
    content: {
      duration: 62,
      audioUrl: null
    },
    title: 'Dune Part 2 exceeded all my expectations',
    category: 'entertainment',
    tags: ['Movies', 'Sci-Fi', 'Denis Villeneuve'],
    author: {
      id: 'user_2',
      name: 'CinephileJoe',
      avatar: null
    },
    stats: {
      views: 456,
      agrees: 134,
      disagrees: 23,
      replies: 45
    },
    createdAt: Date.now() - 14400000,
    isTrending: false,
    replies: []
  },
  {
    id: 'thread_3',
    contentType: 'voice',
    content: {
      duration: 38,
      audioUrl: null
    },
    title: 'Best way to learn Python in 2024',
    category: 'education',
    tags: ['Programming', 'Python', 'Tutorial'],
    author: {
      id: 'user_3',
      name: 'CodeMentor',
      avatar: null
    },
    stats: {
      views: 567,
      agrees: 178,
      disagrees: 15,
      replies: 34
    },
    createdAt: Date.now() - 21600000,
    isTrending: true,
    replies: []
  },
  {
    id: 'thread_4',
    contentType: 'voice',
    content: {
      duration: 53,
      audioUrl: null
    },
    title: 'Indie game recommendations for puzzle lovers',
    category: 'gaming',
    tags: ['Indie', 'Puzzle', 'Recommendations'],
    author: {
      id: 'user_4',
      name: 'IndieGamer',
      avatar: null
    },
    stats: {
      views: 189,
      agrees: 67,
      disagrees: 8,
      replies: 12
    },
    createdAt: Date.now() - 28800000,
    isTrending: false,
    replies: []
  },
  {
    id: 'thread_5',
    contentType: 'voice',
    content: {
      duration: 71,
      audioUrl: null
    },
    title: 'Album of the Year: my top 5 picks',
    category: 'entertainment',
    tags: ['Music', 'Albums', 'Top 5'],
    author: {
      id: 'user_5',
      name: 'MusicCritic',
      avatar: null
    },
    stats: {
      views: 345,
      agrees: 98,
      disagrees: 56,
      replies: 28
    },
    createdAt: Date.now() - 36000000,
    isTrending: false,
    replies: []
  },
  {
    id: 'thread_6',
    contentType: 'voice',
    content: {
      duration: 29,
      audioUrl: null
    },
    title: 'Study techniques that actually work',
    category: 'education',
    tags: ['Study Tips', 'Productivity', 'Learning'],
    author: {
      id: 'user_6',
      name: 'StudyPro',
      avatar: null
    },
    stats: {
      views: 412,
      agrees: 156,
      disagrees: 22,
      replies: 31
    },
    createdAt: Date.now() - 43200000,
    isTrending: false,
    replies: []
  }
];