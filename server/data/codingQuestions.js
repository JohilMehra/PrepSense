const codingQuestions = {
  easy: [
    {
      question: "Time complexity of accessing an array element?",
      options: ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
      answer: "O(1)"
    },
    {
      question: "Which data structure uses FIFO?",
      options: ["Stack", "Queue", "Tree", "Graph"],
      answer: "Queue"
    },
    {
      question: "Which data structure uses LIFO?",
      options: ["Queue", "Stack", "Array", "Graph"],
      answer: "Stack"
    },
    {
      question: "Binary search requires a:",
      options: ["Sorted array", "Heap", "Graph", "Stack"],
      answer: "Sorted array"
    },
    {
      question: "Which sorting algorithm is stable?",
      options: ["Merge sort", "Quick sort", "Heap sort", "Selection sort"],
      answer: "Merge sort"
    },
    {
      question: "Time complexity of linear search?",
      options: ["O(n)", "O(log n)", "O(1)", "O(n log n)"],
      answer: "O(n)"
    },
    {
      question: `Output?
int x = 5;
printf("%d", x++);`,
      options: ["5", "6", "Error", "0"],
      answer: "5"
    },
    {
      question: `Output?
int a = 4;
printf("%d", a << 1);`,
      options: ["8", "6", "4", "2"],
      answer: "8"
    },
    {
      question: `Output?
int a = 3;
printf("%d", a * 2 + 1);`,
      options: ["5", "6", "7", "8"],
      answer: "7"
    },
    {
      question: `Output?
int x = 3;
printf("%d", x + x);`,
      options: ["3", "6", "9", "12"],
      answer: "6"
    },
    {
      question: "Which operation is O(1) in stack?",
      options: ["Push/Pop", "Search", "Sort", "Traversal"],
      answer: "Push/Pop"
    },
    {
      question: "Which operation is O(1) in queue?",
      options: ["Enqueue/Dequeue", "Search", "Sort", "Traversal"],
      answer: "Enqueue/Dequeue"
    },
    {
      question: "Which of these is non-linear?",
      options: ["Tree", "Array", "Stack", "Queue"],
      answer: "Tree"
    },
    {
      question: "Inorder traversal of a BST gives:",
      options: ["Sorted order", "Reverse order", "Random order", "Level order"],
      answer: "Sorted order"
    },
    {
      question: "A hash table stores:",
      options: ["Key-value pairs", "Only integers", "Only strings", "Only trees"],
      answer: "Key-value pairs"
    },
    {
      question: "Recursion mainly uses the:",
      options: ["Stack", "Queue", "Heap", "Graph"],
      answer: "Stack"
    },
    {
      question: "Best case time complexity of linear search?",
      options: ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
      answer: "O(1)"
    },
    {
      question: "Insert at head of a linked list is:",
      options: ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
      answer: "O(1)"
    },
    {
      question: "BFS uses:",
      options: ["Queue", "Stack", "Heap", "Set"],
      answer: "Queue"
    },
    {
      question: "DFS uses:",
      options: ["Stack", "Queue", "Heap", "Array"],
      answer: "Stack"
    },
    {
      question: "Space complexity of adjacency matrix?",
      options: ["O(V^2)", "O(V+E)", "O(E)", "O(log V)"],
      answer: "O(V^2)"
    },
    {
      question: "Space complexity of adjacency list?",
      options: ["O(V+E)", "O(V^2)", "O(V log V)", "O(E^2)"],
      answer: "O(V+E)"
    },
    {
      question: "Worst case time complexity of bubble sort?",
      options: ["O(n^2)", "O(n log n)", "O(n)", "O(log n)"],
      answer: "O(n^2)"
    },
    {
      question: "Best case time complexity of insertion sort?",
      options: ["O(n)", "O(n^2)", "O(log n)", "O(n log n)"],
      answer: "O(n)"
    },
    {
      question: "Selection sort performs how many swaps?",
      options: ["O(n)", "O(n^2)", "O(log n)", "O(1)"],
      answer: "O(n)"
    },
    {
      question: "Circular queue is useful because it:",
      options: ["Reuses freed space", "Sorts data", "Removes duplicates", "Stores only one element"],
      answer: "Reuses freed space"
    },
    {
      question: "The top of a stack is the:",
      options: ["Last pushed element", "First pushed element", "Middle element", "Random element"],
      answer: "Last pushed element"
    },
    {
      question: "Time complexity of traversing an array of size n?",
      options: ["O(n)", "O(1)", "O(log n)", "O(n log n)"],
      answer: "O(n)"
    },
    {
      question: "Height of a balanced BST is:",
      options: ["O(log n)", "O(n)", "O(1)", "O(n log n)"],
      answer: "O(log n)"
    },
    {
      question: "A min-heap's root contains:",
      options: ["Smallest element", "Largest element", "Middle element", "Random element"],
      answer: "Smallest element"
    },
    {
      question: "For an odd number x, x & 1 gives:",
      options: ["1", "0", "-1", "x"],
      answer: "1"
    },
    {
      question: "Function call memory is stored in the:",
      options: ["Stack frame", "Heap", "Register only", "Queue"],
      answer: "Stack frame"
    }
  ],

  medium: [
    {
      question: `Output?
int i = 5;
printf("%d %d", i, i++);`,
      options: ["5 5", "5 6", "6 5", "Undefined"],
      answer: "Undefined"
    },
    {
      question: `Output?
int a = 1, b = 2;
printf("%d", a+++b);`,
      options: ["3", "4", "Error", "Undefined"],
      answer: "3"
    },
    {
      question: `Output?
int x = 0;
if (x)
  printf("Yes");
else
  printf("No");`,
      options: ["Yes", "No", "Error", "None"],
      answer: "No"
    },
    {
      question: `Output?
int x = 10;
if (x > 5)
  if (x < 15)
    printf("A");
  else
    printf("B");`,
      options: ["A", "B", "None", "Error"],
      answer: "A"
    },
    {
      question: `Output?
int x = 5;
printf("%d", x / 2);`,
      options: ["2", "2.5", "3", "Error"],
      answer: "2"
    },
    {
      question: `Output?
int x = 5;
printf("%d", x % 2);`,
      options: ["1", "0", "2", "Error"],
      answer: "1"
    },
    {
      question: `Output?
int x = 4;
printf("%d", x >> 1);`,
      options: ["2", "4", "1", "0"],
      answer: "2"
    },
    {
      question: `Output?
int x = 5;
printf("%d", x & 1);`,
      options: ["1", "0", "5", "Error"],
      answer: "1"
    },
    {
      question: "Insertion in a binary heap takes:",
      options: ["O(log n)", "O(n)", "O(1)", "O(n log n)"],
      answer: "O(log n)"
    },
    {
      question: "Average search in a hash table is:",
      options: ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
      answer: "O(1)"
    },
    {
      question: "Accessing an element in a linked list is:",
      options: ["O(n)", "O(1)", "O(log n)", "O(n log n)"],
      answer: "O(n)"
    },
    {
      question: "Inorder traversal of BST returns:",
      options: ["Sorted order", "Reverse order", "Level order", "Random order"],
      answer: "Sorted order"
    },
    {
      question: "Best case time complexity of quicksort is:",
      options: ["O(n log n)", "O(n^2)", "O(n)", "O(log n)"],
      answer: "O(n log n)"
    },
    {
      question: "Space complexity of merge sort is:",
      options: ["O(n)", "O(1)", "O(log n)", "O(n log n)"],
      answer: "O(n)"
    },
    {
      question: "DFS uses:",
      options: ["Stack", "Queue", "Heap", "Array"],
      answer: "Stack"
    },
    {
      question: "BFS uses:",
      options: ["Queue", "Stack", "Heap", "Set"],
      answer: "Queue"
    },
    {
      question: "Collision handling in a hash table can be done using:",
      options: ["Chaining", "Sorting", "Traversal", "Recursion"],
      answer: "Chaining"
    },
    {
      question: "Topological sort works on:",
      options: ["DAG", "Tree", "Heap", "Queue"],
      answer: "DAG"
    },
    {
      question: "Recursion can cause:",
      options: ["Stack overflow", "Heap overflow only", "No memory use", "Faster CPU"],
      answer: "Stack overflow"
    },
    {
      question: "Space complexity of adjacency matrix is:",
      options: ["O(V^2)", "O(V+E)", "O(E)", "O(log V)"],
      answer: "O(V^2)"
    },
    {
      question: "Balance factor of an AVL tree node is usually in:",
      options: ["-1, 0, 1", "0, 1, 2", "-2, 0, 2", "Any integer"],
      answer: "-1, 0, 1"
    },
    {
      question: "Dijkstra's algorithm is a:",
      options: ["Greedy algorithm", "Divide and conquer", "Backtracking algorithm", "Brute force algorithm"],
      answer: "Greedy algorithm"
    },
    {
      question: "Prim's algorithm is used for:",
      options: ["Minimum spanning tree", "Shortest path", "Topological sort", "Traversal"],
      answer: "Minimum spanning tree"
    },
    {
      question: "Kruskal's algorithm typically uses:",
      options: ["Union-Find", "Stack", "Queue", "Hash map only"],
      answer: "Union-Find"
    },
    {
      question: "Floyd-Warshall algorithm finds:",
      options: ["All-pairs shortest paths", "Only BFS order", "MST", "Cycle only"],
      answer: "All-pairs shortest paths"
    },
    {
      question: "Which traversal uses a queue and visits level by level?",
      options: ["BFS", "DFS", "Inorder", "Postorder"],
      answer: "BFS"
    },
    {
      question: "Which data structure is used to implement recursion internally?",
      options: ["Stack", "Queue", "Heap", "Graph"],
      answer: "Stack"
    },
    {
      question: "What is the worst-case time complexity of selection sort?",
      options: ["O(n^2)", "O(n)", "O(log n)", "O(n log n)"],
      answer: "O(n^2)"
    },
    {
      question: "What is the time complexity of traversing a graph with BFS?",
      options: ["O(V+E)", "O(V^2)", "O(E^2)", "O(log V)"],
      answer: "O(V+E)"
    },
    {
      question: "In a min-heap, the parent is:",
      options: ["Smaller than or equal to children", "Always larger than children", "Equal to children", "Randomly related"],
      answer: "Smaller than or equal to children"
    },
    {
      question: "Which statement about linked lists is true?",
      options: ["Random access is not O(1)", "Insert at head is O(n)", "All elements are contiguous", "Search is O(1)"],
      answer: "Random access is not O(1)"
    },
    {
      question: "What does x || y evaluate to in C-style logic if x is non-zero?",
      options: ["1", "0", "x", "y"],
      answer: "1"
    }
  ],

  hard: [
    {
      question: `Output?
int i;
for (i = 0; i < 3; i++);
printf("%d", i);`,
      options: ["2", "3", "0", "Error"],
      answer: "3"
    },
    {
      question: `Output?
int a = 0;
printf("%d %d %d", a, a++, ++a);`,
      options: ["Undefined", "0 1 2", "0 0 2", "Error"],
      answer: "Undefined"
    },
    {
      question: `Output?
int x = 5;
printf("%d", x ^ 1);`,
      options: ["4", "6", "5", "1"],
      answer: "4"
    },
    {
      question: `Output?
int x = 8;
printf("%d", x >> 2);`,
      options: ["2", "4", "1", "8"],
      answer: "2"
    },
    {
      question: `Output?
int x = 7;
printf("%d", x & (x - 1));`,
      options: ["6", "7", "4", "0"],
      answer: "6"
    },
    {
      question: `Output?
int x = 3;
printf("%d", ++x + x++);`,
      options: ["Undefined", "6", "7", "8"],
      answer: "Undefined"
    },
    {
      question: "Worst-case time complexity of quicksort is:",
      options: ["O(n^2)", "O(n log n)", "O(n)", "O(log n)"],
      answer: "O(n^2)"
    },
    {
      question: "Space complexity of merge sort is:",
      options: ["O(n)", "O(1)", "O(log n)", "O(n log n)"],
      answer: "O(n)"
    },
    {
      question: "Worst-case time complexity of insertion sort is:",
      options: ["O(n^2)", "O(n)", "O(log n)", "O(n log n)"],
      answer: "O(n^2)"
    },
    {
      question: "Insertion in an AVL tree takes:",
      options: ["O(log n)", "O(n)", "O(1)", "O(n log n)"],
      answer: "O(log n)"
    },
    {
      question: "Dijkstra using a binary heap has complexity:",
      options: ["O((V+E) log V)", "O(V^2)", "O(E^2)", "O(V log E)"],
      answer: "O((V+E) log V)"
    },
    {
      question: "Kruskal's algorithm complexity is typically:",
      options: ["O(E log E)", "O(V^2)", "O(E^2)", "O(V log V)"],
      answer: "O(E log E)"
    },
    {
      question: "Prim's algorithm with a binary heap is:",
      options: ["O(E log V)", "O(V^2)", "O(E^2)", "O(log V)"],
      answer: "O(E log V)"
    },
    {
      question: "Floyd-Warshall time complexity is:",
      options: ["O(V^3)", "O(V^2)", "O(E log V)", "O(V+E)"],
      answer: "O(V^3)"
    },
    {
      question: "Longest Common Subsequence DP complexity is:",
      options: ["O(mn)", "O(m+n)", "O(log n)", "O(n^2 log n)"],
      answer: "O(mn)"
    },
    {
      question: "Kadane's algorithm solves:",
      options: ["Maximum subarray sum", "Shortest path", "MST", "Binary search"],
      answer: "Maximum subarray sum"
    },
    {
      question: "Trie search complexity depends on:",
      options: ["Length of key", "Number of nodes squared", "Number of edges squared", "Heap size"],
      answer: "Length of key"
    },
    {
      question: "An LRU cache can be implemented efficiently using:",
      options: ["Hash map + doubly linked list", "Queue only", "Stack only", "Tree only"],
      answer: "Hash map + doubly linked list"
    },
    {
      question: "The average time complexity of get/put in an LRU cache is:",
      options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
      answer: "O(1)"
    },
    {
      question: "Detecting a cycle in a linked list with Floyd's algorithm is:",
      options: ["O(n)", "O(n^2)", "O(log n)", "O(1)"],
      answer: "O(n)"
    },
    {
      question: "Reversing a linked list iteratively takes:",
      options: ["O(n) time and O(1) space", "O(1) time and O(n) space", "O(n log n) time", "O(log n) time"],
      answer: "O(n) time and O(1) space"
    },
    {
      question: "Topological sort is possible only for:",
      options: ["DAG", "Tree", "Heap", "Undirected graph"],
      answer: "DAG"
    },
    {
      question: "Cycle detection in a directed graph using DFS needs:",
      options: ["Recursion stack", "Queue", "Heap", "Array sort"],
      answer: "Recursion stack"
    },
    {
      question: "Space complexity of an adjacency list is:",
      options: ["O(V+E)", "O(V^2)", "O(E^2)", "O(log V)"],
      answer: "O(V+E)"
    },
    {
      question: "In a max-heap, the parent is:",
      options: ["Greater than or equal to children", "Smaller than children", "Always equal to children", "Randomly related"],
      answer: "Greater than or equal to children"
    },
    {
      question: "In a min-heap, the parent is:",
      options: ["Less than or equal to children", "Greater than children", "Always equal to children", "Unrelated"],
      answer: "Less than or equal to children"
    },
    {
      question: "Which traversal uses a queue?",
      options: ["BFS", "DFS", "Inorder", "Postorder"],
      answer: "BFS"
    },
    {
      question: "Binary search on a rotated sorted array is:",
      options: ["O(log n)", "O(n)", "O(n log n)", "O(n^2)"],
      answer: "O(log n)"
    },
    {
      question: `Output?
int x = 1, y = 2, z = 3;
printf("%d", x + y * z);`,
      options: ["7", "9", "6", "5"],
      answer: "7"
    },
    {
      question: `Output?
int x = 5;
printf("%d", x++ + 1);`,
      options: ["5", "6", "7", "Error"],
      answer: "6"
    },
    {
      question: `Output?
int x = 6;
printf("%d", x / 2 + x % 2);`,
      options: ["3", "4", "2", "6"],
      answer: "3"
    },
    {
      question: `Output?
int x = 1;
x <<= 3;
printf("%d", x);`,
      options: ["8", "6", "4", "2"],
      answer: "8"
    }
  ]
};

module.exports = { codingQuestions };
