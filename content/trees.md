## Binary Tree Maximum Path Sum
[LeetCode](https://leetcode.com/problems/binary-tree-maximum-path-sum/)

> **Problem:** Return the maximum sum of any non-empty path between two nodes in a binary tree.

```cpp
class Solution {
public:
   int maxpath = INT_MIN;
   int maxPathSum(TreeNode* root) {
       maxPath(root);
       return maxpath;
   }

   int maxPath(TreeNode* root){
       if(!root){
           return 0;
       }

       int leftgain = max(maxPath(root->left), 0);
       int rightgain = max(maxPath(root->right), 0);

       int currentMax = root->val + leftgain + rightgain;
       maxpath = max(currentMax, maxpath);

       return root->val + max(leftgain, rightgain);
   }
};
```

## Maximum Width of Binary Tree
[LeetCode](https://leetcode.com/problems/maximum-width-of-binary-tree/)

> **Problem:** Return the maximum width of any level, counted between the leftmost and rightmost non-null nodes and including the null positions between them.

BFS with heap-style indices, re-based at each level to avoid overflow.

```cpp
class Solution {
public:
    int widthOfBinaryTree(TreeNode* root) {
        if(!root){
            return 0;
        }

        long long res = 1;
        queue<pair<TreeNode*, long long>> q;
        q.push({root, 0});

        while(!q.empty()){
            long long start = q.front().second;
            long long end = q.back().second;

            res = max(res, end-start+1);
            int n = q.size();

            for(int i = 0 ; i < n; ++i){
                auto cur = q.front();
                q.pop();

                long long idx = cur.second - start;

                if(cur.first->left){
                    q.push({cur.first->left, (long long) 2*idx + 1});
                }
                if(cur.first->right){
                    q.push({cur.first->right, (long long) 2*idx + 2});
                }
            }
        }
        return res;
    }
};
```

## Construct Binary Tree from Inorder and Postorder Traversal
[LeetCode](https://leetcode.com/problems/construct-binary-tree-from-inorder-and-postorder-traversal/)

> **Problem:** Build the binary tree from its inorder and postorder traversals (values are unique).

```cpp
class Solution {
public:
    TreeNode* buildTree(vector<int>& inorder, vector<int>& postorder) {
        // Hash map of value -> index in inorder traversal
        unordered_map<int, int> inMap;
        for(int i = 0; i < inorder.size(); i++){
            inMap[inorder[i]] = i;
        }

        // Initialize postStart as the last index of postorder
        int postStart = postorder.size() - 1;

        return buildTreeHelper(postorder, inorder, postStart, 0, inorder.size() - 1, inMap);
    }

private:
    TreeNode* buildTreeHelper(vector<int>& postorder, vector<int>& inorder, int& postStart, int inStart, int inEnd, unordered_map<int, int>& inMap){
        // Base case: no elements to construct the tree
        if(postStart < 0 || inStart > inEnd){
            return nullptr;
        }

        // The current root value is the last element in postorder
        int rootVal = postorder[postStart];
        TreeNode* root = new TreeNode(rootVal);
        postStart--; // Move to the next root in postorder

        int inRoot = inMap[rootVal];

        // Important: Build the right subtree before the left subtree
        root->right = buildTreeHelper(postorder, inorder, postStart, inRoot + 1, inEnd, inMap);
        root->left = buildTreeHelper(postorder, inorder, postStart, inStart, inRoot - 1, inMap);

        return root;
    }
};
```

### Context recap

1. **Identify the root:** the last element of the current postorder segment is the root of the current subtree.
2. **Split inorder:** locate the root in inorder to get the left and right subtree boundaries.
3. **Recurse:** build the right subtree first, then the left (postorder is consumed from the end).

### Why `inStart` does not change for the left subtree

`[inStart, inEnd]` is the inorder range of the current subtree, and the root sits at `inRoot`.

- Left subtree = `[inStart, inRoot - 1]`: it starts where the current segment starts, so `inStart` stays.
- Right subtree = `[inRoot + 1, inEnd]`: it ends where the current segment ends, so `inEnd` stays.

### Worked example

Inorder `[9, 3, 15, 20, 7]`, postorder `[9, 15, 7, 20, 3]`.

1. Initial call: segment `[0, 4]`, `postStart = 4`, root `3`, `inRoot = 1`.
2. Right subtree: segment `[2, 4]`, `postStart = 3`, root `20`, `inRoot = 3`.
3. Right of 20: segment `[4, 4]`, `postStart = 2`, root `7`. Both children null.
4. Left of 20: segment `[2, 2]`, `postStart = 1`, root `15`. Both children null.
5. Left of 3: segment `[0, 0]`, `postStart = 0`, root `9`. Both children null.

```
    3
   / \
  9   20
     /  \
    15   7
```

## Populating Next Right Pointers in Each Node
[LeetCode](https://leetcode.com/problems/populating-next-right-pointers-in-each-node/)

> **Problem:** In a perfect binary tree, set each node's `next` pointer to its right neighbour on the same level (or NULL).

No solution recorded in the notes.

## Convert Sorted Array to Binary Search Tree
[LeetCode 108](https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/)

> **Problem:** Convert a sorted array into a height-balanced BST.

Given an ascending array, build a height-balanced BST by always picking the middle element as root.

```cpp
class Solution {
public:
   TreeNode* sortedArrayToBST(vector<int>& nums) {
       return convert(nums, 0, nums.size()-1);
   }

   TreeNode* convert(vector<int>& nums, int start, int end){
       // Base case: if the subarray is invalid, return NULL
       if (start > end) {
           return NULL;
       }

       // Calculate the middle index to use as the pivot
       int pivot = (end + start) / 2;
       TreeNode* root = new TreeNode(nums[pivot]);

       // Recursively build the left and right subtrees
       root->left = convert(nums, start, pivot - 1);
       root->right = convert(nums, pivot + 1, end);

       return root;
   }
};
```

## Validate Binary Search Tree
[LeetCode](https://leetcode.com/problems/validate-binary-search-tree/)

> **Problem:** Return whether a binary tree is a valid BST.

Inorder traversal must be strictly increasing.

```cpp
class Solution {
public:
    bool isValidBST(TreeNode* root) {
        long prev = LONG_MIN;
        return inorderTraversal(root, prev);
    }

    bool inorderTraversal(TreeNode* root, long& prev){
        if(!root){
            return true;
        }
        if(!inorderTraversal(root->left, prev)){
            return false;
        }
        if(root->val <= prev){
            return false;
        }
        prev = root->val;
        return inorderTraversal(root->right, prev);
    }
};
```

## Lowest Common Ancestor of a Binary Search Tree
[LeetCode](https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/)

> **Problem:** Return the lowest common ancestor of nodes `p` and `q` in a BST.

```cpp
class Solution {
public:
   TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
       int small = min(p->val, q->val);
       int large = max(p->val, q->val);

       while(root){
           if(root->val > large){
               root = root->left;
           }
           else if(root->val < small){
               root = root->right;
           }
           else return root;
       }
       return NULL;
   }
};
```

## Reverse Odd Levels of Binary Tree
[LeetCode](https://leetcode.com/problems/reverse-odd-levels-of-binary-tree/)

> **Problem:** In a perfect binary tree, reverse the node values on every odd level.

### DFS

```cpp
class Solution {
public:
    TreeNode* reverseOddLevels(TreeNode* root) {
        dfs(root->left, root->right, 1);
        return root;
    }
private:
    void dfs(TreeNode* leftNode, TreeNode* rightNode, int level){
        if(!leftNode || !rightNode)
            return;
        // current level is odd, then swap
        if(level%2 == 1){
            int temp = leftNode->val;
            leftNode->val = rightNode->val;
            rightNode->val = temp;
        }

        dfs(leftNode->left, rightNode->right, level+1);
        dfs(leftNode->right, rightNode->left, level+1);
    }
};
```

### BFS

```cpp
class Solution {
public:
    TreeNode* reverseOddLevels(TreeNode* root) {
        if(!root) return NULL;

        queue<TreeNode*> q;
        q.push(root);
        int level = 0;

        while (!q.empty()) {
            vector<TreeNode*> levelArray;
            int n = q.size();

            for (int i = 0; i < n; i++) {
                auto node = q.front();
                q.pop();
                levelArray.push_back(node);
                if (node->left) q.push(node->left);
                if (node->right) q.push(node->right);
            }
            if (level % 2 == 1) {
                int left = 0, right = levelArray.size() - 1;
                while(left < right){
                    int temp = levelArray[left]->val;
                    levelArray[left]->val = levelArray[right]->val;
                    levelArray[right]->val = temp;
                    left++;
                    right--;
                }
            }
            level++;
        }
        return root;
    }
};
```

## Kth Smallest Element in a BST
[LeetCode](https://leetcode.com/problems/kth-smallest-element-in-a-bst/)

> **Problem:** Return the `k`-th smallest value (1-indexed) in a BST.

```cpp
class Solution {
public:
    int kthSmallest(TreeNode* root, int k) {
        int kSmallest = INT_MIN;
        int counter = 0;
        inorder(root, counter, k, kSmallest);
        return kSmallest;
    }

    void inorder(TreeNode* root, int& counter, int k, int& kSmallest){
        if(!root || counter >= k){
            return;
        }
        // Traverse left subtree
        inorder(root->left, counter, k, kSmallest);

        // Increment counter after visiting left subtree
        counter++;
        if(counter == k){
            kSmallest = root->val;
            return;
        }
        inorder(root->right, counter, k, kSmallest);
    }
};
```

## Unique Binary Search Trees II
[LeetCode](https://leetcode.com/problems/unique-binary-search-trees-ii/description/)

> **Problem:** Return every structurally unique BST that stores the values `1..n`.

```cpp
class Solution {
public:
    vector<TreeNode*> generateTrees(int n) {
        map<pair<int, int>, vector<TreeNode*>> memo;
        return allPossibleBST(1, n, memo);
    }

    vector<TreeNode*> allPossibleBST(int start, int end, map<pair<int, int>, vector<TreeNode*>>& memo){
        vector<TreeNode*> res;
        if(start > end){
            res.push_back(nullptr);
            return res;
        }

        if(memo.find(make_pair(start, end)) != memo.end()){
            return memo[make_pair(start, end)];
        }

        for(int i = start; i <= end; i++){
            vector<TreeNode*> leftSubtree = allPossibleBST(start, i-1, memo);
            vector<TreeNode*> rightSubtree = allPossibleBST(i+1, end, memo);

            for(auto left: leftSubtree){
                for(auto right: rightSubtree){
                    TreeNode* node = new TreeNode(i, left, right);
                    res.push_back(node);
                }
            }
        }
        return memo[make_pair(start, end)] = res;
    }
};
```

## Closest Nodes Queries in a Binary Search Tree
[LeetCode](https://leetcode.com/problems/closest-nodes-queries-in-a-binary-search-tree/)

> **Problem:** For each query `q`, return `[largest value ≤ q, smallest value ≥ q]` from the BST, using -1 when one doesn't exist.

Inorder traversal gives a sorted array; binary-search each query. O(n log n) for n queries.

```cpp
class Solution {
public:
    void inorderTraverse(TreeNode* root, vector<int>& inorder) {
        if (!root) {
            return;
        }
        inorderTraverse(root->left, inorder);
        inorder.push_back(root->val);
        inorderTraverse(root->right, inorder);
    }

    vector<vector<int>> closestNodes(TreeNode* root, vector<int>& queries) {
        vector<int> inorder;
        inorderTraverse(root, inorder);

        vector<vector<int>> res;

        for (auto& query : queries) {
            vector<int> ans(2, -1);
            // value >= query
            auto it = lower_bound(inorder.begin(), inorder.end(), query);

            if (it != inorder.end()) {
                ans[1] = *it;
            }

            if (it != inorder.begin()) {
                if (it != inorder.end() && *it == query) {
                    ans[0] = *it;
                }
                else {
                    it--; // go to the element before the current element
                    ans[0] = *it;
                }
            }
            else {
                // Edge case: `it` is at the beginning and may match query
                if (*it == query) {
                    ans[0] = *it;
                }
            }
            res.push_back(ans);
        }
        return res;
    }
};
```

## Delete Node in a BST
[LeetCode](https://leetcode.com/problems/delete-node-in-a-bst/)

> **Problem:** Delete the node with value `key` from a BST and return the new root.

```cpp
class Solution {
public:
    TreeNode* deleteNode(TreeNode* root, int key) {
        if(!root){
            return root;
        }

        if(key < root->val){
            root->left = deleteNode(root->left, key);
        }
        else if(key > root->val){
            root->right = deleteNode(root->right, key);
        }
        else{
            if(!root->left && !root->right){
                delete root;
                return nullptr;
            }
            if(!root->right){
                TreeNode* temp = root->left;
                delete root;
                return temp;
            }
            else if(!root->left){
                TreeNode* temp = root->right;
                delete root;
                return temp;
            }
            else{
                TreeNode* successor = findMin(root->right);
                root->val = successor->val;
                root->right = deleteNode(root->right, successor->val);
            }
        }
        return root;
    }
private:
    TreeNode* findMin(TreeNode* node){
        while(node->left){
            node = node->left;
        }
        return node;
    }
};
```

## Kth Largest Sum in a Binary Tree
[LeetCode](https://leetcode.com/problems/kth-largest-sum-in-a-binary-tree/)

> **Problem:** Return the `k`-th largest level sum, or -1 if the tree has fewer than `k` levels.

### Brute force — O(N log N)

```cpp
class Solution {
public:
    long long kthLargestLevelSum(TreeNode* root, int k) {
        // Level order traversal, store each level's sum, sort, return element k-1
        vector<long long> sumArray;
        queue<TreeNode*> q;
        q.push(root);

        while(!q.empty()){
            int n = q.size(); // Number of nodes at the current level
            long long sum = 0;
            for(int i = 0; i < n; i++){
                TreeNode* node = q.front();
                q.pop();
                sum += node->val;
                if(node->left) q.push(node->left);
                if(node->right) q.push(node->right);
            }
            sumArray.push_back(sum);
        }

        if(k > sumArray.size()) return -1; // k is invalid

        sort(sumArray.begin(), sumArray.end(), greater<long long>());
        return sumArray[k-1];
    }
};
```

### Optimised — min-heap keeps the k largest at the top, O(N log K)

```cpp
class Solution {
public:
    long long kthLargestLevelSum(TreeNode* root, int k) {
        priority_queue<long long, vector<long long>, greater<long long>> pq;

        queue<TreeNode*> q;
        q.push(root);
        while (!q.empty()) {
            int n = q.size();
            long long sum = 0;
            for (int i = 0; i < n; i++) {
                TreeNode* node = q.front();
                q.pop();
                sum += node->val;
                if (node->left) q.push(node->left);
                if (node->right) q.push(node->right);
            }
            if (pq.size() < k) {
                pq.push(sum);
            }
            else if (sum > pq.top()) {
                pq.pop();
                pq.push(sum);
            }
        }
        if (k > pq.size())
            return -1;
        else
            return pq.top();
    }
};
```

Trace with level sums `[50, 20, 30, 40, 60, 10]`, `k = 3`: the heap fills with `[20, 50, 30]`; 40 replaces 20; 60 replaces 30; 10 is ignored. The final heap is `[40, 50, 60]` and `top() = 40` is the 3rd largest.

## Cousins in Binary Tree II
[LeetCode](https://leetcode.com/problems/cousins-in-binary-tree-ii/)

> **Problem:** Replace each node's value with the sum of its cousins' values (same depth, different parent).

Two-pass BFS: first compute each level's sum, then set each node to `levelSum[level] - sibling_sum`. O(n).

```cpp
class Solution {
public:
    TreeNode* replaceValueInTree(TreeNode* root) {
        vector<int> levelSum;
        queue<TreeNode*> q;
        q.push(root);

        while (!q.empty()) {
            int n = q.size();
            int sum = 0;
            for (int i = 0; i < n; i++) {
                TreeNode* node = q.front();
                q.pop();
                sum += node->val;
                if(node->left) q.push(node->left);
                if(node->right) q.push(node->right);
            }
            levelSum.push_back(sum);
        }

        queue<pair<TreeNode*, int>> qt;
        qt.push({root, root->val});
        int level = 0;

        while(!qt.empty()){
            int n = qt.size();
            for(int i = 0; i < n; i++){
                auto [node, sibling_sum] = qt.front();
                qt.pop();
                node->val = levelSum[level] - sibling_sum;

                int child_sum = 0;
                if(node->left) child_sum += node->left->val;
                if(node->right) child_sum += node->right->val;

                if(node->left) qt.push({node->left, child_sum});
                if(node->right) qt.push({node->right, child_sum});
            }
            level++;
        }
        return root;
    }
};
```

## Flip Equivalent Binary Trees
[LeetCode](https://leetcode.com/problems/flip-equivalent-binary-trees/)

> **Problem:** A flip swaps a node's left and right children. Return whether some sequence of flips turns one tree into the other.

```cpp
class Solution {
public:
    bool flipEquiv(TreeNode* root1, TreeNode* root2) {
        if(root1 == NULL && root2 == NULL){
            return true;
        }
        if(root1 == NULL || root2 == NULL)
            return false;

        if(root1->val != root2->val){
            return false;
        }

        bool swap = flipEquiv(root1->left, root2->left) && flipEquiv(root1->right, root2->right);
        bool noswap = flipEquiv(root1->right, root2->left) && flipEquiv(root1->left, root2->right);

        return swap || noswap;
    }
};
```

## Height of Binary Tree After Subtree Removal Queries
[LeetCode](https://leetcode.com/problems/height-of-binary-tree-after-subtree-removal-queries/)

> **Problem:** For each query, remove the subtree rooted at that node and return the tree's height. Each query is independent.

Solved with an Euler tour. Each node appears at its first and last occurrence in the tour; removing a subtree removes the range between them. The answer is the max depth outside that range, from prefix/suffix maxima.

```cpp
class Solution {
public:
    vector<int> treeQueries(TreeNode* root, vector<int>& queries) {
        vector<int> eulerTour;
        unordered_map<int, int> nodeHeights, firstOccur, lastOccur;

        // Perform DFS to build Euler tour and node information
        dfs(root, 0, eulerTour, nodeHeights, firstOccur, lastOccur);

        int tourSize = eulerTour.size();
        vector<int> maxDepthLeft(tourSize), maxDepthRight(tourSize);

        maxDepthLeft[0] = maxDepthRight[tourSize - 1] = nodeHeights[root->val];

        for (int i = 1; i < tourSize; i++) {
            maxDepthLeft[i] = max(nodeHeights[eulerTour[i]], maxDepthLeft[i - 1]);
        }
        for (int i = tourSize - 2; i >= 0; i--) {
            maxDepthRight[i] = max(maxDepthRight[i + 1], nodeHeights[eulerTour[i]]);
        }

        // Process queries
        vector<int> results(queries.size());
        for (int i = 0; i < queries.size(); i++) {
            int queryNode = queries[i];
            int leftMax = (firstOccur[queryNode] > 0)
                              ? maxDepthLeft[firstOccur[queryNode] - 1]
                              : 0;
            int rightMax = (lastOccur[queryNode] < tourSize - 1)
                               ? maxDepthRight[lastOccur[queryNode] + 1]
                               : 0;
            results[i] = max(leftMax, rightMax);
        }
        return results;
    }

private:
    void dfs(TreeNode* root, int height, vector<int>& eulerTour,
             unordered_map<int, int>& nodeHeights,
             unordered_map<int, int>& firstOccur,
             unordered_map<int, int>& lastOccur) {
        if (!root)
            return;

        nodeHeights[root->val] = height;
        firstOccur[root->val] = eulerTour.size();
        eulerTour.push_back(root->val);

        dfs(root->left, height + 1, eulerTour, nodeHeights, firstOccur, lastOccur);
        dfs(root->right, height + 1, eulerTour, nodeHeights, firstOccur, lastOccur);

        lastOccur[root->val] = eulerTour.size();
        eulerTour.push_back(root->val);
    }
};
```
