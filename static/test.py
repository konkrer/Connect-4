def my_evaluate_board(board):

  board_score = 0 

  for col in range(len(board)):
    for row in range(len(board[0])):
      symbol = board[col][row]
      space_streak = 1 if symbol == ' ' else 0
        # space_streak = 1
      #else:
        #symbol = board[col][row]
      
      # horizontal
      hor_score = horizontal_check(board, col, row, symbol, space_streak)
      board_score += hor_score
        
      # vertical
      vert_score = vertical_check(board, col, row, symbol, space_streak)
      board_score += vert_score
      
      # diagonal down right
      dwn_right = diag_down_right(board, col, row, symbol, space_streak)
      board_score += dwn_right
      
      # diagnol up right
      up_right = diag_up_right(board, col, row, symbol, space_streak)
      board_score += up_right
      
  return board_score     


def horizontal_check(board, col, row, symbol, space_streak):
  count = 0
  end_space_streak = 0
  # if valid start column
  if col < 4:
    for i in range(1, 4):
      if space_streak:
        if board[col+i][row] == ' ':
          space_streak += 1
          # if all spaces eval to zero
          if space_streak == 3:
            return 0
        else:
          space_streak = -space_streak
          symbol = board[col+i][row]
      else:
        if board[col+i][row] == symbol:
          count += 1
          end_space_streak = 0
        elif board[col+i][row] == ' ':
          end_space_streak += 1
        # if this four group is blocked by opponent eval to 0
        else:
          return 0
    if (count > 0):
      count = -count if symbol == 'O' else count
      # if count is +/-2 double value this is three in a row.
      # if two pieces with two empties on each side douvle val
      if (
        abs(count) == 2 
        or
        (space_streak == -1 and end_space_streak == 1)
       ):
        return count * 2
      return count
  return 0
  

def vertical_check(board, col, row, symbol, space_streak):
  count = 0
  if row < 3:
    for i in range(1, 4):
      if space_streak > 0 and board[col][row+i] == ' ':
        space_streak += 1
        if space_streak == 3:
          return 0
      elif space_streak > 0 and board[col][row+i] != ' ':
        space_streak = -space_streak
        symbol = board[col][row+i]
      else:
        if board[col][row+i] == symbol:
          count += 1
        elif board[col][row+i] != symbol:
          return 0   
    if (count > 0):
      if symbol == 'O':
        count = -count
      if abs(count) == 2:
        return count * 2
      else:
        return count
  else:
    return 0

def diag_down_right(board, col, row, symbol, space_streak):
  count = 0
  end_space_streak = 0
  if (row < 3) and (col < 4):
    for i in range(1, 4):
      if (space_streak > 0) and (board[col+i][row+i] == ' '):
        space_streak += 1
        if space_streak == 3:
          return 0
      elif space_streak > 0 and board[col+i][row+i] != ' ':
        space_streak = -space_streak
        symbol = board[col+i][row+i]
      else:
        if board[col+i][row+i] == symbol:
          count += 1
          end_space_streak = 0
        elif board[col+i][row+i] == ' ':
          end_space_streak += 1
        else:
          return 0
    if (count > 0):
      if symbol == 'O':
        count = -count
      if abs(count) == 2:
        return count * 2
      else:
        if (space_streak == -1) and (end_space_streak == 1):
          return 2 * count
        else: 
          return count
    else:
      return 0
  else:
    return 0

def diag_up_right(board, col, row, symbol, space_streak):
  count = 0
  end_space_streak = 0
  if (row > 2) and (col < 4):
    for i in range(1, 4):
      if (space_streak > 0) and (board[col+i][row-i] == ' '):
        space_streak += 1
        if space_streak == 3:
          return 0
      elif space_streak > 0 and board[col+i][row-i] != ' ':
        space_streak = -space_streak
        symbol = board[col+i][row-i]
      else:
        if board[col+i][row-i] == symbol:
          count += 1
          end_space_streak = 0
        elif board[col+i][row-i] == ' ':
          end_space_streak += 1
        else:
          return 0
    if (count > 0):
      if symbol == 'O':
        count = -count
      if abs(count) == 2:
        return count * 2
      else:
        if (space_streak == -1) and (end_space_streak == 1):
          return 2 * count
        else: 
          return count
    else:
      return 0
  else:
    return 0