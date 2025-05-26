package models

import (
	"database/sql"
	"fmt"
	"forum/config"
	"os"
	"path/filepath"

	_ "github.com/mattn/go-sqlite3"
)

// initDB initializes the database and returns a connection
func InitDB() (*sql.DB, error) {
	dbPath := filepath.Join("./database", "forum.db")

	// Check if database file exists
	firstTime := false
	if _, err := os.Stat(dbPath); os.IsNotExist(err) {
		firstTime = true
		// Create directory if it doesn't exist
		if err := os.MkdirAll("./database", 0755); err != nil {
			return nil, fmt.Errorf("failed to create database directory: %v", err)
		}
	}

	db, err := sql.Open("sqlite3", dbPath+"?_foreign_keys=on")
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %v", err)
	}

	// Verify connection works
	if err := db.Ping(); err != nil {
		db.Close()
		return nil, fmt.Errorf("failed to connect to database: %v", err)
	}

	// Set some basic connection pool settings
	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(5)

	// Initialize database schema and data
	if firstTime {
		if err := createTables(db); err != nil {
			db.Close()
			return nil, fmt.Errorf("failed to create tables: %v", err)
		}

		if err := createIndexes(db); err != nil {
			db.Close()
			return nil, fmt.Errorf("failed to create indexes: %v", err)
		}

		if err := populateCategories(db, config.Categories); err != nil {
			db.Close()
			return nil, fmt.Errorf("failed to populate categories: %v", err)
		}
		fmt.Println("Database initialized successfully.")
	} else {
		fmt.Println("Database already exists. Skipping initialization.")
	}

	return db, nil
}

func createTables(db *sql.DB) error {
	// Start a transaction for atomicity
	tx, err := db.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %v", err)
	}
	defer tx.Rollback()

	// Define all table creation SQL statements
	tableStatements := []string{
		config.CreateUserTable,
		config.CreateUserAuthTable,
		config.CreateSessionsTable,
		config.CreateCategoriesTable,
		config.CreatePostsTable,
		config.CreateCommentsTable,
		config.CreateReactionsTable,
	}

	// Execute each table creation statement
	for i, stmt := range tableStatements {
		_, err = tx.Exec(stmt)
		if err != nil {
			return fmt.Errorf("statement %d failed: %v\nSQL: %s", i+1, err, stmt)
		}
	}

	// Commit transaction
	return tx.Commit()
}

func createIndexes(db *sql.DB) error {
	// Start a transaction for atomicity
	tx, err := db.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %v", err)
	}
	defer tx.Rollback()

	// Define all index creation SQL statements
	indexStatements := []string{
		config.IdxPostsUserID,
		config.IdxPostsCategoryID,
		config.IdxCommentsPostID,
		config.IdxCommentsUserID,
		config.IdxReactionsUserID,
		config.IdxReactionsPostID,
		config.IdxReactionsCommentID,
	}

	// Execute each index creation statement
	for _, stmt := range indexStatements {
		_, err = tx.Exec(stmt)
		if err != nil {
			return fmt.Errorf("failed to execute create index statement: %s: %v", stmt, err)
		}
	}

	// Commit transaction
	return tx.Commit()
}

func populateCategories(db *sql.DB, categories []string) error {
	if len(categories) == 0 {
		return nil
	}

	// Use transaction for atomicity
	tx, err := db.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %v", err)
	}
	defer tx.Rollback()

	stmt, err := tx.Prepare(`INSERT OR IGNORE INTO categories (name) VALUES (?)`)
	if err != nil {
		return fmt.Errorf("failed to prepare statement: %v", err)
	}
	defer stmt.Close()

	for _, category := range categories {
		if _, err := stmt.Exec(category); err != nil {
			return fmt.Errorf("failed to insert category '%s': %v", category, err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %v", err)
	}

	fmt.Println("Categories populated (duplicates ignored if existed).")
	return nil
}

