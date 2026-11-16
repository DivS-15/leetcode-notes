## Best Time to Buy and Sell Stock
[LeetCode](https://leetcode.com/problems/best-time-to-buy-and-sell-stock/)

> **Problem:** Buy on one day and sell on a later day. Return the maximum profit (0 if no profit is possible).

**Why Greedy Works**
- Optimal substructure: the best profit selling on day `i` is `prices[i]` minus the lowest price before it.
- Each step depends only on the minimum price seen so far, so one pass is enough.
```cpp
class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int minPrice = INT_MAX, maxProfit = 0;
        for(int price : prices){
            minPrice = min(minPrice, price);
            maxProfit = max(maxProfit, price - minPrice);
        }
        return maxProfit;
    }
};
```
## Meeting Rooms II
[LeetCode](https://leetcode.com/problems/meeting-rooms-ii/)

> **Problem:** Given meeting time intervals, return the minimum number of conference rooms needed.

Sort the meetings and keep the end times in a min-heap. If a meeting starts after the earliest end, it reuses that room; otherwise it needs a new one.
```cpp
class Solution {
public:
    int minMeetingRooms(vector<vector<int>>& intervals) {
        sort(intervals.begin(), intervals.end());
        priority_queue<int, vector<int>, greater<int>> pq;
        for(auto &slot : intervals) pq.push(slot[1]);
        int cnt = 0;
        for(auto &slot : intervals){
            if(slot[0] >= pq.top()) pq.pop();
            else cnt++;
        }
        return cnt;
    }
};
```
## Jump Game
[LeetCode](https://leetcode.com/problems/jump-game/)

> **Problem:** Each element is your maximum jump length from that position. Return whether you can reach the last index.

Asked in Nielsen's OA.
```cpp
class Solution {
public:
    bool canJump(vector<int>& nums) {
        int n = nums.size(), maxReach = 0;
        for(int i = 0; i < n; i++){
            if(i > maxReach) return false;
            maxReach = max(maxReach, i + nums[i]);
        }
        return maxReach >= n-1;
    }
};
```
## Jump Game II
[LeetCode](https://leetcode.com/problems/jump-game-ii/)

> **Problem:** Each element is your maximum jump length from that position. Return the minimum number of jumps to reach the last index.

### BFS
O(n·1000) in the worst case.
```cpp
class Solution {
public:
    int jump(vector<int>& nums) {
        int n = nums.size();
        if(n == 1) return 0;
        queue<int> q;
        vector<bool> visited(n, false);
        q.push(0);
        visited[0] = true;
        int jumps = 0;
        while(!q.empty()){
            int size = q.size();
            jumps++;
            for(int s = 0; s < size; s++){
                int i = q.front(); q.pop();
                for(int j = 1; j <= nums[i]; j++){
                    int next = i + j;
                    if(next >= n-1) return jumps;
                    if(!visited[next]){
                        visited[next] = true;
                        q.push(next);
                    }
                }
            }
        }
        return jumps;
    }
};
```
### Greedy, O(n)
```cpp
class Solution {
public:
    int jump(vector<int>& nums) {
        int n = nums.size();
        int currentEnd = 0, farthest = 0, jumps = 0;
        for(int i = 0; i < n-1; i++){
            farthest = max(farthest, i + nums[i]);
            if(i == currentEnd){
                jumps++;
                currentEnd = farthest;
            }
        }
        return jumps;
    }
};
```
### Range window
```cpp
class Solution {
public:
    int jump(vector<int>& nums) {
        int n = nums.size();
        int l = 0, r = 0, jumps = 0;
        while(r < n-1){
            int farthest = 0;
            for(int i = l; i <= r; i++){
                farthest = max(farthest, i + nums[i]);
            }
            l = r+1;
            r = farthest;
            jumps++;
        }
        return jumps;
    }
};
```
