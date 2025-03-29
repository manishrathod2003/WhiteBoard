import React, { useContext, useState, useRef, useEffect } from 'react';
import Whiteboard from '../../components/whiteboard/whiteboard';
import { StoreContext } from '../../Context/StoreContext';
import { useAuth, UserButton } from '@clerk/clerk-react';
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  FolderOpenIcon,
  CheckIcon,
  XIcon
} from 'lucide-react';
import './Dashboard.css'
import axios from 'axios';

const Dashboard = () => {
  const { whiteboards, setWhiteboards, refreshWhiteboards, url, isAuthenticated } = useContext(StoreContext);
  const [activeBoard, setActiveBoard] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef(null);
  const { getToken } = useAuth()

  const normalizedWhiteboards = whiteboards.map(board => ({
    ...board,
    id: board._id || board.id || `board-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: board.createdAt instanceof Date ? board.createdAt : new Date(),
    lastModified: board.lastModified instanceof Date ? board.lastModified : new Date()
  }));

  const createNewBoard = () => {
    const newBoard = {
      id: `board-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `Untitled Board ${normalizedWhiteboards.length + 1}`,
      createdAt: new Date(),
      lastModified: new Date()
    };

    setWhiteboards([...normalizedWhiteboards, newBoard]);
    setActiveBoard(newBoard);
    setNewBoardName(newBoard.name);
  };

  const deleteBoard = async (id) => {
    if (id.startsWith('board-')) {
      const updatedBoards = normalizedWhiteboards.filter(board =>
        board._id !== id && board.id !== id
      );
      setWhiteboards(updatedBoards);
      if (activeBoard && (activeBoard._id === id || activeBoard.id === id)) {
        setActiveBoard(null);
      }
      return;
    }

    try {
      const token = await getToken()
      const response = await axios.post(url + '/whiteboard/delete', { id }, {
        headers: {
          token
        }
      });

      if (response.data.success) {
        alert(response.data.message);
        refreshWhiteboards()
      }
    } catch (error) {
      console.error('Error deleting whiteboard:', error);
    }
  }

  const startEditing = () => {
    setIsEditing(true);
    setNewBoardName(activeBoard.name);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  };

  const handleNameChange = (e) => {
    setNewBoardName(e.target.value);
  };

  const saveBoardName = () => {
    if (!newBoardName.trim()) return;

    const updatedBoards = normalizedWhiteboards.map(board =>
      (board._id === activeBoard._id || board.id === activeBoard.id)
        ? {
          ...board,
          name: newBoardName,
          lastModified: new Date()
        }
        : board
    );

    setWhiteboards(updatedBoards);
    setActiveBoard(prevBoard => ({
      ...prevBoard,
      name: newBoardName,
      lastModified: new Date()
    }));
    setIsEditing(false);
  };

  const filteredBoards = normalizedWhiteboards

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>My Whiteboards</h2>
          <div className="sidebar-actions">
            <button
              className="btn new-board-btn"
              onClick={createNewBoard}
              title="Create New Board"
            >
              <PlusIcon size={20} />
            </button>
          </div>
        </div>

        <div className="search-container">
          <input
            type="text"
            placeholder="Search boards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="board-list">
          {filteredBoards.length === 0 ? (
            <div className="no-boards-message">
              <FolderOpenIcon size={40} />
              <p>No boards found</p>
            </div>
          ) : (
            filteredBoards.map((board) => (
              <div
                key={board._id || board.id}
                className={`board-item ${activeBoard?.id === board.id || activeBoard?._id === board._id ? 'active' : ''}`}
                onClick={() => setActiveBoard(board)}
              >
                <span className="board-name">{board.name}</span>
                <div className="board-actions">
                  <button
                    className="delete-board-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteBoard(board._id);
                    }}
                    title="Delete Board"
                  >
                    <TrashIcon size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <main className="dashboard-main">
        {activeBoard ? (
          <div className="whiteboard-wrapper">
            <div className="board-title">
              {isEditing ? (
                <div className="edit-board-name">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newBoardName}
                    onChange={handleNameChange}
                    onBlur={saveBoardName}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveBoardName();
                      if (e.key === 'Escape') setIsEditing(false);
                    }}
                    className="board-name-input"
                  />
                </div>
              ) : (
                <h1 onClick={startEditing}>{activeBoard.name}</h1>
              )}
              <UserButton />
            </div>
            <Whiteboard boardId={activeBoard._id} name={activeBoard.name} />
          </div>
        ) : (
          <div className="welcome-message">
            <FolderOpenIcon size={80} strokeWidth={1} />
            <h2>Welcome to CollabBoard</h2>
            <p>Create a new board or select an existing one to get started</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
