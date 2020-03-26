
def minimax(input_board, is_maximizing, depth, alpha, beta, eval_function):
  if game_is_over(input_board) or depth == 0:
        return [eval_function(input_board), "", depth]
        
  best_depth = -float("Inf")
  if is_maximizing:
    best_value = -float("Inf")
    moves = available_moves(input_board)
    random.shuffle(moves)
    
    best_move = moves[0]
    for move in moves:
      
      new_board = deepcopy(input_board)
      select_space(new_board, move, "X")
      results = minimax(new_board, False, depth - 1, alpha, beta, eval_function)
      #print(results, 'results')
      hypothetical_value = results[0]
      if hypothetical_value > best_value:
        best_value = hypothetical_value
        best_move = move
        best_depth = results[2]
      if hypothetical_value == best_value and results[2] > best_depth:
        best_move = move
        best_depth = results[2]
      alpha = max(alpha, best_value)
      if alpha >= beta:
        #print('alpha break')
        break
    return [best_value, best_move, best_depth]
  else:
    best_value = float("Inf")
    moves = available_moves(input_board)
    random.shuffle(moves)
    #print(moves)
    best_move = moves[0]
    for move in moves:
      
      #print(move)
      new_board = deepcopy(input_board)
      select_space(new_board, move, "O")
      results = minimax(new_board, True, depth - 1, alpha, beta, eval_function)
      #print(results, 'results')
      hypothetical_value = results[0]
      
      if hypothetical_value < best_value:
        best_value = hypothetical_value
        best_move = move
        best_depth = results[2]
      if hypothetical_value == best_value and results[2] > best_depth:
        best_move = move
        best_depth = results[2]
      beta = min(beta, best_value)
      if alpha >= beta:
        #print('alpha break')
        break
    return [best_value, best_move, best_depth