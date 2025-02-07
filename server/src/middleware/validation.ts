social-network-server
├── src
│   ├── config
│   │   ├── database.ts
│   │   └── config.ts
│   ├── controllers
│   │   ├── authController.ts
│   │   ├── userController.ts
│   │   └── postController.ts
│   ├── middleware
│   │   ├── auth.ts
│   │   └── validation.ts
│   ├── models
│   │   ├── User.ts
│   │   └── Post.ts
│   ├── routes
│   │   ├── authRoutes.ts
│   │   ├── userRoutes.ts
│   │   └── postRoutes.ts
│   ├── types
│   │   └── index.ts
│   ├── utils
│   │   └── helpers.ts
│   └── app.ts
├── tests
│   ├── auth.test.ts
│   ├── user.test.ts
│   └── post.test.ts
├── .env.example
├── package.json
├── tsconfig.json
└── README.md