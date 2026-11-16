## Valid Parentheses
[LeetCode](https://leetcode.com/problems/valid-parentheses/)

> **Problem:** Return whether a string of `()[]{}` is properly opened and closed in the right order.

```cpp
class Solution {
public:
    bool isValid(string s) {
        stack<char> st;
        for(char c : s){
            if(c == '(' || c == '{' || c == '[') st.push(c);
            else{
                if(st.empty()) return false;
                char top = st.top();
                if((c == ')' && top == '(') || (c == '}' && top == '{') || (c == ']' && top == '[')) st.pop();
                else return false;
            }
        }
        return st.empty();
    }
};
```
## Next Greater Element I
[LeetCode](https://leetcode.com/problems/next-greater-element-i/)

> **Problem:** `nums1` is a subset of `nums2`. For each element of `nums1`, return the first greater element to its right in `nums2`, or -1.

### Brute force, O(n×m)
```cpp
class Solution {
public:
    vector<int> nextGreaterElement(vector<int>& nums1, vector<int>& nums2) {
        vector<int> ans;
        for(int num : nums1){
            int res = -1;
            bool found = false;
            for(int j = 0; j < nums2.size(); j++){
                if(nums2[j] == num) found = true;
                else if(found && nums2[j] > num){
                    res = nums2[j];
                    break;
                }
            }
            ans.push_back(res);
        }
        return ans;
    }
};
```
### Monotonic stack, O(n+m)
```cpp
class Solution {
public:
    unordered_map<int,int> ans;
    void findNextGreater(vector<int>& nums2){
        stack<int> st;
        for(int i = nums2.size()-1; i >= 0; i--){
            while(!st.empty() && st.top() <= nums2[i]) st.pop();
            if(st.empty()) ans[nums2[i]] = -1;
            else ans[nums2[i]] = st.top();
            st.push(nums2[i]);
        }
    }
    vector<int> nextGreaterElement(vector<int>& nums1, vector<int>& nums2) {
        findNextGreater(nums2);
        vector<int> res;
        for(int num : nums1) res.push_back(ans[num]);
        return res;
    }
};
```
## Next Greater Element II
[LeetCode](https://leetcode.com/problems/next-greater-element-ii/)

> **Problem:** In a circular array, return the next greater element for every element, or -1.

### Brute force
```cpp
class Solution {
public:
    vector<int> nextGreaterElements(vector<int>& nums) {
        int n = nums.size();
        vector<int> ans(n, -1);
        for(int i = 0; i < n; i++){
            for(int j = i+1; j <= i+n-1; j++){
                if(nums[j%n] > nums[i]){
                    ans[i] = nums[j%n];
                    break;
                }
            }
        }
        return ans;
    }
};
```
### Stack over a doubled array
O(4N). Pretend the array is doubled and iterate `2n-1..0`.
```cpp
class Solution {
public:
    vector<int> nextGreaterElements(vector<int>& nums) {
        int n = nums.size();
        vector<int> ans(n, -1);
        stack<int> st;
        for(int i = 2*n-1; i >= 0; i--){
            int ind = i%n;
            while(!st.empty() && st.top() <= nums[ind]) st.pop();
            if(i < n){
                if(!st.empty()) ans[ind] = st.top();
            }
            st.push(nums[ind]);
        }
        return ans;
    }
};
```
## Trapping Rain Water
[LeetCode](https://leetcode.com/problems/trapping-rain-water/)

> **Problem:** Given bar heights of width 1, return how much rain water they trap.

### Prefix max / suffix max
O(N) time, O(N) space.
```cpp
class Solution {
public:
    int trap(vector<int>& height) {
        int n = height.size();
        vector<int> prefixMax(n), suffixMax(n);
        prefixMax[0] = height[0];
        for(int i = 1; i < n; i++) prefixMax[i] = max(prefixMax[i-1], height[i]);
        suffixMax[n-1] = height[n-1];
        for(int i = n-2; i >= 0; i--) suffixMax[i] = max(suffixMax[i+1], height[i]);
        int total = 0;
        for(int i = 0; i < n; i++){
            int leftMax = prefixMax[i], rightMax = suffixMax[i];
            if(height[i] < leftMax && height[i] < rightMax){
                total += min(leftMax, rightMax) - height[i];
            }
        }
        return total;
    }
};
```
### Two pointers
O(N) time, O(1) space.
```cpp
class Solution {
public:
    int trap(vector<int>& height) {
        int left = 0, right = height.size()-1;
        int leftMax = 0, rightMax = 0, total = 0;
        while(left < right){
            if(height[left] < height[right]){
                if(leftMax > height[left]) total += leftMax - height[left];
                else leftMax = height[left];
                left++;
            }
            else{
                if(rightMax > height[right]) total += rightMax - height[right];
                else rightMax = height[right];
                right--;
            }
        }
        return total;
    }
};
```
## Sum of Subarray Minimums
[LeetCode](https://leetcode.com/problems/sum-of-subarray-minimums/)

> **Problem:** Return the sum of `min(subarray)` over all contiguous subarrays (mod 1e9+7).

### Brute force
```cpp
class Solution {
public:
    int sumSubarrayMins(vector<int>& arr) {
        int n = arr.size(), mod = 1e9+7;
        long long sum = 0;
        for(int i = 0; i < n; i++){
            int mini = arr[i];
            for(int j = i; j < n; j++){
                mini = min(mini, arr[j]);
                sum = (sum + mini) % mod;
            }
        }
        return sum;
    }
};
```
### Contribution with stacks
Each `arr[i]` is the minimum of `left * right` subarrays, where `left = i - psee` and `right = nse - i`.
```cpp
class Solution {
public:
    vector<int> nse(vector<int>& arr){
        int n = arr.size();
        vector<int> ans(n);
        stack<int> st;
        for(int i = n-1; i >= 0; i--){
            while(!st.empty() && arr[st.top()] >= arr[i]) st.pop();
            ans[i] = st.empty() ? n : st.top();
            st.push(i);
        }
        return ans;
    }
    vector<int> psee(vector<int>& arr){
        int n = arr.size();
        vector<int> ans(n);
        stack<int> st;
        for(int i = 0; i < n; i++){
            while(!st.empty() && arr[st.top()] > arr[i]) st.pop();
            ans[i] = st.empty() ? -1 : st.top();
            st.push(i);
        }
        return ans;
    }
    int sumSubarrayMins(vector<int>& arr) {
        vector<int> next = nse(arr);
        vector<int> prev = psee(arr);
        int mod = 1e9+7;
        long long total = 0;
        for(int i = 0; i < arr.size(); i++){
            long long left = i - prev[i];
            long long right = next[i] - i;
            total = (total + (left*right % mod)*arr[i] % mod) % mod;
        }
        return total;
    }
};
```
## Sum of Subarray Ranges
[LeetCode](https://leetcode.com/problems/sum-of-subarray-ranges/)

> **Problem:** Return the sum of `max - min` over all subarrays.

Answer = (sum of subarray maximums) - (sum of subarray minimums).
```cpp
class Solution {
public:
    vector<int> nse(vector<int>& arr){
        int n = arr.size();
        vector<int> ans(n);
        stack<int> st;
        for(int i = n-1; i >= 0; i--){
            while(!st.empty() && arr[st.top()] >= arr[i]) st.pop();
            ans[i] = st.empty() ? n : st.top();
            st.push(i);
        }
        return ans;
    }
    vector<int> psee(vector<int>& arr){
        int n = arr.size();
        vector<int> ans(n);
        stack<int> st;
        for(int i = 0; i < n; i++){
            while(!st.empty() && arr[st.top()] > arr[i]) st.pop();
            ans[i] = st.empty() ? -1 : st.top();
            st.push(i);
        }
        return ans;
    }
    vector<int> nge(vector<int>& arr){
        int n = arr.size();
        vector<int> ans(n);
        stack<int> st;
        for(int i = n-1; i >= 0; i--){
            while(!st.empty() && arr[st.top()] <= arr[i]) st.pop();
            ans[i] = st.empty() ? n : st.top();
            st.push(i);
        }
        return ans;
    }
    vector<int> pgee(vector<int>& arr){
        int n = arr.size();
        vector<int> ans(n);
        stack<int> st;
        for(int i = 0; i < n; i++){
            while(!st.empty() && arr[st.top()] < arr[i]) st.pop();
            ans[i] = st.empty() ? -1 : st.top();
            st.push(i);
        }
        return ans;
    }
    long long minSubarray(vector<int>& arr){
        vector<int> next = nse(arr), prev = psee(arr);
        long long total = 0;
        for(int i = 0; i < arr.size(); i++){
            long long left = i - prev[i], right = next[i] - i;
            total += left*right*arr[i];
        }
        return total;
    }
    long long maxSubarray(vector<int>& arr){
        vector<int> next = nge(arr), prev = pgee(arr);
        long long total = 0;
        for(int i = 0; i < arr.size(); i++){
            long long left = i - prev[i], right = next[i] - i;
            total += left*right*arr[i];
        }
        return total;
    }
    long long subArrayRanges(vector<int>& nums) {
        return maxSubarray(nums) - minSubarray(nums);
    }
};
```
## Asteroid Collision
[LeetCode](https://leetcode.com/problems/asteroid-collision/)

> **Problem:** Asteroids move right (positive) or left (negative). When two meet, the smaller explodes, and both explode if equal. Return the state after all collisions.

Use a `vector<int>` as the stack so it can be returned directly.
```cpp
class Solution {
public:
    vector<int> asteroidCollision(vector<int>& asteroids) {
        vector<int> st;
        for(int a : asteroids){
            if(a > 0) st.push_back(a);
            else{
                while(!st.empty() && st.back() > 0 && st.back() < abs(a)) st.pop_back();
                if(!st.empty() && st.back() == abs(a)) st.pop_back();
                else if(st.empty() || st.back() < 0) st.push_back(a);
            }
        }
        return st;
    }
};
```
## Largest Rectangle in Histogram
[LeetCode](https://leetcode.com/problems/largest-rectangle-in-histogram/)

> **Problem:** Return the area of the largest rectangle in a histogram of bar heights with width 1.

When a bar is popped, the current index is its next smaller element and the new top is its previous smaller element.
```cpp
class Solution {
public:
    int largestRectangleArea(vector<int>& heights) {
        int n = heights.size(), maxArea = 0;
        stack<int> st;
        for(int i = 0; i < n; i++){
            while(!st.empty() && heights[i] <= heights[st.top()]){
                int el = st.top(); st.pop();
                int nse = i;
                int pse = st.empty() ? -1 : st.top();
                maxArea = max(maxArea, heights[el]*(nse-pse-1));
            }
            st.push(i);
        }
        while(!st.empty()){
            int el = st.top(); st.pop();
            int nse = n;
            int pse = st.empty() ? -1 : st.top();
            maxArea = max(maxArea, heights[el]*(nse-pse-1));
        }
        return maxArea;
    }
};
```
## Remove K Digits
[LeetCode](https://leetcode.com/problems/remove-k-digits/)

> **Problem:** Remove `k` digits from the number string `num` to make the smallest possible number.

- Keep the digits increasing: pop while the current digit is smaller than the top and `k > 0`.
- If `k > 0` after the loop, pop from the end.
- Strip leading zeros.
- Return "0" if nothing is left.
```cpp
class Solution {
public:
    string removeKdigits(string num, int k) {
        string st;
        for(int i = 0; i < num.size(); i++){
            while(!st.empty() && k > 0 && num[i] < st.back()){
                st.pop_back();
                k--;
            }
            st.push_back(num[i]);
        }
        while(k > 0 && !st.empty()){
            st.pop_back();
            k--;
        }
        int i = 0;
        while(i < st.size() && st[i] == '0') i++;
        st = st.substr(i);
        if(st.empty()) return "0";
        return st;
    }
};
```
## Online Stock Span
[LeetCode](https://leetcode.com/problems/online-stock-span/)

> **Problem:** For each new price, return its span: the number of consecutive days, ending today, with price ≤ today's price.

```cpp
class StockSpanner {
public:
    stack<pair<int,int>> st;
    int ind = -1;
    StockSpanner() {
    }
    int next(int price) {
        ind++;
        while(!st.empty() && price >= st.top().first) st.pop();
        int ans = ind - (st.empty() ? -1 : st.top().second);
        st.push({price, ind});
        return ans;
    }
};
```
## Sliding Window Maximum
[LeetCode](https://leetcode.com/problems/sliding-window-maximum/)

> **Problem:** Return the maximum of every window of size `k` as it slides across the array.

Monotonic deque of indices, values decreasing from front to back.
```cpp
class Solution {
public:
    vector<int> maxSlidingWindow(vector<int>& nums, int k) {
        deque<int> dq;
        vector<int> ans;
        for(int i = 0; i < nums.size(); i++){
            if(!dq.empty() && dq.front() <= i-k) dq.pop_front();
            while(!dq.empty() && nums[i] >= nums[dq.back()]) dq.pop_back();
            dq.push_back(i);
            if(i >= k-1) ans.push_back(nums[dq.front()]);
        }
        return ans;
    }
};
```
## Find the celebrity
[GeeksforGeeks](https://www.geeksforgeeks.org/problems/the-celebrity-problem/1)

> **Problem:** In an `n × n` matrix, `mat[i][j] = 1` means `i` knows `j`. A celebrity is known by everyone and knows no one. Return the celebrity's index, or -1.

Not the LeetCode version. Two pointers eliminate one candidate per step, then verify the survivor.
```cpp
class Solution {
public:
    int celebrity(vector<vector<int>>& mat) {
        int n = mat.size();
        int top = 0, down = n-1;
        while(top < down){
            if(mat[top][down] == 1) top++;
            else if(mat[down][top] == 1) down--;
            else{
                top++;
                down--;
            }
        }
        if(top > down) return -1;
        for(int j = 0; j < n; j++){
            if(j == top) continue;
            if(mat[top][j] == 0 && mat[j][top] == 1) continue;
            return -1;
        }
        return top;
    }
};
```
## Number of Visible People in a Queue
[LeetCode](https://leetcode.com/problems/number-of-visible-people-in-a-queue/)

> **Problem:** Person `i` can see person `j > i` if everyone between them is shorter than both. Return how many people each person can see to their right.

Similar to Next Greater Element.
- Iterate from right to left with a stack of indices.
- Everyone shorter than `heights[i]` on the stack is visible to `i`: pop them and count each.
- If the stack is still not empty, the next taller person is also visible: count one more.
- Push `i`.
```cpp
class Solution {
public:
    vector<int> canSeePersonsCount(vector<int>& arr) {
        int n = arr.size();
        vector<int> ans(n, 0);
        stack<int> st;
        for(int i = n-1; i >= 0; i--){
            while(!st.empty() && arr[i] > arr[st.top()]){
                st.pop();
                ans[i]++;
            }
            if(!st.empty()) ans[i]++;
            st.push(i);
        }
        return ans;
    }
};
```
## LRU Cache
[LeetCode](https://leetcode.com/problems/lru-cache/)

> **Problem:** Design a Least Recently Used cache with O(1) `get(key)` and `put(key, value)`. When capacity is exceeded, evict the least recently used key.

Doubly linked list (most recent right after `head`) plus a hash map from key to node.
```cpp
class LRUCache {
public:
    class node{
    public:
        int key, val;
        node* next;
        node* prev;
        node(int _key, int _val){
            key = _key;
            val = _val;
        }
    };
    node* head = new node(-1, -1);
    node* tail = new node(-1, -1);
    int cap;
    unordered_map<int, node*> m;

    LRUCache(int capacity) {
        cap = capacity;
        head->next = tail;
        tail->prev = head;
    }
    void addnode(node* newnode){
        node* temp = head->next;
        newnode->next = temp;
        newnode->prev = head;
        head->next = newnode;
        temp->prev = newnode;
    }
    void deletenode(node* delnode){
        node* delprev = delnode->prev;
        node* delnext = delnode->next;
        delprev->next = delnext;
        delnext->prev = delprev;
    }
    int get(int key) {
        if(m.find(key) != m.end()){
            node* resnode = m[key];
            int res = resnode->val;
            m.erase(key);
            deletenode(resnode);
            addnode(resnode);
            m[key] = head->next;
            return res;
        }
        return -1;
    }
    void put(int key, int value) {
        if(m.find(key) != m.end()){
            node* existingnode = m[key];
            m.erase(key);
            deletenode(existingnode);
        }
        if(m.size() == cap){
            m.erase(tail->prev->key);
            deletenode(tail->prev);
        }
        addnode(new node(key, value));
        m[key] = head->next;
    }
};
```
