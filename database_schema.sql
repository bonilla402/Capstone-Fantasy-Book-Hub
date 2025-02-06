DROP TABLE IF EXISTS book_topics, book_authors, books, authors, topics, users, discussion_groups, group_discussions, reviews CASCADE;

CREATE TABLE users
(
    id            SERIAL PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    email         VARCHAR(100) NOT NULL UNIQUE,
    password_hash TEXT         NOT NULL,
    is_admin      BOOLEAN   DEFAULT FALSE,
    profile_image TEXT,
    bio           TEXT,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE authors
(
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    bio        TEXT,
    birth_year INTEGER,
    death_year INTEGER
);

CREATE TABLE books
(
    id             SERIAL PRIMARY KEY,
    title          VARCHAR(255) NOT NULL,
    cover_image    TEXT,
    year_published INTEGER,
    synopsis       TEXT,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE book_authors
(
    book_id   INTEGER REFERENCES books (id) ON DELETE CASCADE,
    author_id INTEGER REFERENCES authors (id) ON DELETE CASCADE,
    PRIMARY KEY (book_id, author_id)
);

CREATE TABLE topics
(
    id   SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE book_topics
(
    book_id  INTEGER REFERENCES books (id) ON DELETE CASCADE,
    topic_id INTEGER REFERENCES topics (id) ON DELETE CASCADE,
    PRIMARY KEY (book_id, topic_id)
);

CREATE TABLE reviews
(
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    book_id     INTEGER NOT NULL REFERENCES books (id) ON DELETE CASCADE,
    rating      INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE discussion_groups
(
    id          SERIAL PRIMARY KEY,
    group_name  VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_by  INTEGER      NOT NULL REFERENCES users (id) ON DELETE SET NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE group_discussions
(
    id         SERIAL PRIMARY KEY,
    group_id   INTEGER      NOT NULL REFERENCES discussion_groups (id) ON DELETE CASCADE,
    user_id    INTEGER      NOT NULL REFERENCES users (id) ON DELETE SET NULL,
    book_id    INTEGER      NOT NULL REFERENCES books (id) ON DELETE CASCADE,
    title      VARCHAR(255) NOT NULL,
    content    TEXT         NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE group_members (
                               user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                               group_id INTEGER NOT NULL REFERENCES discussion_groups(id) ON DELETE CASCADE,
                               PRIMARY KEY (user_id, group_id)
);
