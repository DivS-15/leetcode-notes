## Maximum Sum of Distinct Subarrays With Length K
[LeetCode](https://leetcode.com/problems/maximum-sum-of-distinct-subarrays-with-length-k/)

> **Problem:** Return the maximum sum of any length-`k` subarray whose elements are all distinct (0 if there's none).

```cpp
class Solution {
public:
    long long maximumSubarraySum(vector<int>& nums, int k) {
        long long ans = 0;
        long long currentSum = 0;
        int begin = 0, end = 0;

        unordered_map<int, int> numToIndex;
        while(end < nums.size()){
            int currNum = nums[end];
            int lastOccur;
            if(numToIndex.find(currNum) != numToIndex.end()){
                lastOccur = numToIndex[currNum];
            }
            else lastOccur = -1;

            while(begin <= lastOccur || (end-begin+1 > k)){
                currentSum -= nums[begin];
                begin++;
            }
            numToIndex[currNum] = end;
            currentSum += nums[end];
            if(end-begin+1 == k){
                ans = max(ans, currentSum);
            }
            end++;
        }
        return ans;
    }
};
```

## Maximum Points You Can Obtain from Cards
[LeetCode](https://leetcode.com/problems/maximum-points-you-can-obtain-from-cards/) · Time O(k + k)

> **Problem:** Take exactly `k` cards, each from the start or the end of the row. Return the maximum total points.

```cpp
class Solution {
public:
    int maxScore(vector<int>& cardPoints, int k) {
        int lsum = 0, rsum = 0, n = cardPoints.size();
        int maxSum = 0;

        // first take all the elements from the left window
        for(int i = 0; i < k; i++){
            lsum += cardPoints[i];
        }
        maxSum = lsum;
        int rindex = n-1;

        // then shrink the left window while expanding the right, tracking the max sum
        for(int i = k-1; i>= 0; i--){
            lsum -= cardPoints[i];
            rsum += cardPoints[rindex];
            rindex--;
            maxSum = max(maxSum, lsum + rsum);
        }
        return maxSum;
    }
};
```

## Longest Substring Without Repeating Characters
[LeetCode](https://leetcode.com/problems/longest-substring-without-repeating-characters/) · Time O(N)

> **Problem:** Return the length of the longest substring with no repeating characters.

```cpp
class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        int r = 0, l = 0, n = s.length(), maxlen = 0;
        unordered_map<char, int> mp; // char --> index at which it was last seen

        while (r < n) {
            if (mp.find(s[r]) != mp.end()) {
                // jump l only if the last occurrence is inside the window
                if (mp[s[r]] >= l) {
                    l = mp[s[r]] + 1;
                }
            }
            mp[s[r]] = r;
            maxlen = max(maxlen, r - l + 1);
            r++;
        }
        return maxlen;
    }
};
```

### Another approach (frequency map)

```cpp
class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        unordered_map<char, int> mp;
        int l = 0, r = 0, n = s.length();
        int maxLen = 0;
        while(r < n){
            mp[s[r]]++;
            while(mp[s[r]] > 1){
                mp[s[l]]--;
                if(mp[s[l]] == 0) mp.erase(s[l]);
                l++;
            }
            maxLen = max(maxLen, r-l+1);
            r++;
        }
        return maxLen;
    }
};
```

## Max Consecutive Ones III
[LeetCode](https://leetcode.com/problems/max-consecutive-ones-iii/)

> **Problem:** Return the longest run of consecutive 1s in a binary array if you may flip at most `k` 0s.

Longest subarray with at most `k` zeros.

```cpp
class Solution {
public:
    int longestOnes(vector<int>& nums, int k) {
        int l = 0, r=0, zeros = 0, maxlen = 0;
        int n = nums.size();

        while(r < n){
            if(nums[r] == 0) zeros++;

            if(zeros > k){
                if(nums[l] == 0) zeros--;
                l++; // shrink the window whether or not we drop a zero
            }

            if(zeros <= k){
                maxlen = max(maxlen, r-l+1);
            }
            r++;
        }
        return maxlen;
    }
};
```

## Fruit Into Baskets
[LeetCode](https://leetcode.com/problems/fruit-into-baskets/)

> **Problem:** You have two baskets, each holding a single fruit type. Return the longest contiguous run of trees whose fruit fits in them, i.e. the longest subarray with at most 2 distinct values.

Longest subarray with at most 2 distinct values.

### Brute force — O(n²), TLE

```cpp
class Solution {
public:
    int totalFruit(vector<int>& fruits) {
        int n = fruits.size();
        int maxLen= 0;
        for(int i = 0; i < n; i++){
            set<int> s;
            for(int j = i; j < n; j++){
                s.insert(fruits[j]);
                if(s.size() <= 2) maxLen = max(maxLen, j-i+1);
                if(s.size() > 2) break;
            }
        }
        return maxLen;
    }
};
```

### Sliding window with a map — O(N+N) worst case, O(3) space

```cpp
class Solution {
public:
    int totalFruit(vector<int>& fruits) {
        int left = 0, r = 0, maxlen = 0;
        unordered_map<int, int> mp;
        int n = fruits.size();

        while (r < n) {
            mp[fruits[r]]++;
            if (mp.size() > 2) {
                while (mp.size() > 2) {
                    mp[fruits[left]]--;
                    if (mp[fruits[left]] == 0) {
                        mp.erase(fruits[left]);
                    }
                    left++;
                }
            }
            if (mp.size() <= 2) {
                maxlen = max(maxlen, r - left + 1);
            }
            r++;
        }
        return maxlen;
    }
};
```

### O(N): drop the inner while

Move `left` by one only when the map has more than 2 keys; the window never shrinks below the best length found.

```cpp
class Solution {
public:
    int totalFruit(vector<int>& fruits) {
        int left = 0, r = 0, maxlen = 0;
        unordered_map<int, int> mp;
        int n = fruits.size();

        while (r < n) {
            mp[fruits[r]]++;
            if (mp.size() > 2) {
                mp[fruits[left]]--;
                if (mp[fruits[left]] == 0) {
                    mp.erase(fruits[left]);
                }
                left++;
            }
            if (mp.size() <= 2) {
                maxlen = max(maxlen, r - left + 1);
            }
            r++;
        }
        return maxlen;
    }
};
```

## Longest Sub-string with at most K Distinct Characters
[Naukri Code 360](https://www.naukri.com/code360/problems/longest-sub-string-with-at-most-k-distinct-characters_2221410)

> **Problem:** Return the length of the longest substring with at most `k` distinct characters.

### Brute force

```cpp
#include <bits/stdc++.h>

int getLengthofLongestSubstring(int k, string s)
{
   int n = s.length(), maxlen = 0;
   unordered_map<char, int> mp;

   for(int i = 0; i < n; i++){
      mp.clear();
      for(int j = i; j < n; j++){
         mp[s[j]]++;
         if(mp.size() <= k){
            maxlen = max(maxlen, j-i+1);
         }
         else break;
      }
   }
   return maxlen;
}
```

### Optimised sliding window

```cpp
#include <bits/stdc++.h>

int getLengthofLongestSubstring(int k, string s)
{
   int n = s.length(), maxlen = 0;
   int l = 0, r = 0;
   unordered_map<char, int> mp;

   while (r < n){
      mp[s[r]]++;

      if(mp.size() > k){
         mp[s[l]]--;
         if(mp[s[l]] == 0)
            mp.erase(s[l]);
         l++;
      }
      if(mp.size() <= k){
         maxlen = max(maxlen, r-l+1);
      }
      r++;
   }
   return maxlen;
}
```

## Number of Substrings Containing All Three Characters
[LeetCode](https://leetcode.com/problems/number-of-substrings-containing-all-three-characters/)

> **Problem:** Given a string of `a`, `b` and `c`, count the substrings that contain all three at least once.

### Brute force

```cpp
class Solution {
public:
    int numberOfSubstrings(string s) {
        int n = s.length();
        int count = 0;

        for(int i = 0; i < n; i++){
            vector<int> hash(3);
            for(int j = i; j < n; j++){
                hash[s[j] - 'a'] = 1;
                if(hash[0] + hash[1] + hash[2] == 3)
                    count++;
            }
        }
        return count;
    }
};
```

### Sliding window

Track the last index of `a`, `b`, `c`. Once all three are seen, every start index up to the smallest last-seen index works: `count += 1 + min(lastSeen[0], lastSeen[1], lastSeen[2])`.

```cpp
class Solution {
public:
    int numberOfSubstrings(string s) {
        int n = s.length();
        int count = 0;
        vector<int> lastSeen = {-1, -1, -1};

        for(int i = 0; i < n; i++){
            lastSeen[s[i] - 'a'] = i;

            if(lastSeen[0] != -1 && lastSeen[1] != -1 && lastSeen[2] != -1)
                count += 1 + min({lastSeen[0], lastSeen[1], lastSeen[2]});
        }
        return count;
    }
};
```

## Longest Repeating Character Replacement
[LeetCode](https://leetcode.com/problems/longest-repeating-character-replacement/) · O(N·26) time, O(26) space

> **Problem:** You may replace at most `k` characters. Return the length of the longest substring that can be made of one repeated letter.

A window is valid when `length - maxFrequency <= k`.

```cpp
class Solution {
public:
    int characterReplacement(string s, int k) {
        int maxF = 0, maxLen = 0, n = s.size();
        int l = 0, r = 0;
        vector<int> hash(26, 0);
        while (r < n) {
            hash[s[r] - 'A']++;
            maxF = max(maxF, hash[s[r] - 'A']);
            if (r-l+1 - maxF > k) {
                hash[s[l] - 'A']--;
                maxF = 0;
                for(int i = 0; i < 26; i++){
                    maxF = max(maxF, hash[i]);
                }
                l++;
            }
            if (r-l+1 - maxF <= k) {
                maxLen = max(maxLen, r - l + 1);
            }
            r++;
        }
        return maxLen;
    }
};
```

### Without recomputing `maxF`

There is no need to shrink `maxF` each time: only a larger `maxF` can improve the answer, so keeping the window size fixed until a better length appears also works.

```cpp
class Solution {
public:
    int characterReplacement(string s, int k) {
        int maxF = 0, maxLen = 0, n = s.size();
        int l = 0, r = 0;
        vector<int> hash(26, 0);
        while (r < n) {
            hash[s[r] - 'A']++;
            maxF = max(maxF, hash[s[r] - 'A']);
            if (r-l+1 - maxF > k) {
                hash[s[l] - 'A']--;
                maxF = 0;
                l++;
            }
            if (r-l+1 - maxF <= k) {
                maxLen = max(maxLen, r - l + 1);
            }
            r++;
        }
        return maxLen;
    }
};
```

## Binary Subarrays With Sum
[LeetCode](https://leetcode.com/problems/binary-subarrays-with-sum/) · video: *L9. Binary Subarrays With Sum | 2 Pointers and Sliding Window*

> **Problem:** Count the non-empty subarrays of a binary array whose sum is `goal`.

`count(sum == goal) = count(sum <= goal) - count(sum <= goal - 1)`.

```cpp
class Solution {
public:
    int numSubarraysWithSum(vector<int>& nums, int goal) {
        return countSubGoal(nums, goal) - countSubGoal(nums, goal-1);
    }

    int countSubGoal(vector<int>& nums, int goal){
        if(goal < 0)
            return 0;

        int l = 0, r = 0, sum = 0, count = 0, n = nums.size();

        while(r < n){
            sum += nums[r];
            while(sum > goal){
                sum -= nums[l];
                l++;
            }
            if(sum <= goal)
                count += r-l+1;
            r++;
        }
        return count;
    }
};
```

## Count Number of Nice Subarrays
[LeetCode](https://leetcode.com/problems/count-number-of-nice-subarrays/)

> **Problem:** Count the subarrays that contain exactly `k` odd numbers.

Treat odd numbers as 1 and even as 0; then it is Binary Subarrays With Sum = k.

```cpp
class Solution {
public:
    int numberOfSubarrays(vector<int>& nums, int k) {
        return countSubGoal(nums, k) - countSubGoal(nums, k-1);
    }

    int countSubGoal(vector<int>& nums, int goal){
        if(goal < 0)
            return 0;

        int l = 0, r = 0, sum = 0, count = 0, n = nums.size();

        while(r < n){
            sum += nums[r]%2;
            while(sum > goal){
                sum -= nums[l]%2;
                l++;
            }
            if(sum <= goal)
                count += r-l+1;
            r++;
        }
        return count;
    }
};
```

## Subarrays with K Different Integers
[LeetCode](https://leetcode.com/problems/subarrays-with-k-different-integers/)

> **Problem:** Count the subarrays with exactly `k` distinct integers.

```cpp
class Solution {
public:
    int subarraysWithKDistinct(vector<int>& nums, int k) {
        return getCount(nums, k) - getCount(nums, k-1);
    }

    int getCount(vector<int>& nums, int k){
        int n = nums.size(), count = 0;
        int l = 0, r= 0;
        unordered_map<int, int> mp;

        while(r < n){
            mp[nums[r]]++;
            while(mp.size() > k){
                mp[nums[l]]--;
                if(mp[nums[l]] == 0) mp.erase(nums[l]);
                l++;
            }
            if(mp.size() <= k){
                count += r-l+1;
            }
            r++;
        }
        return count;
    }
};
```

## Minimum Window Substring
[LeetCode](https://leetcode.com/problems/minimum-window-substring/)

> **Problem:** Return the smallest substring of `s` that contains every character of `t`, duplicates included ("" if there's none).

No solution recorded in the notes.

## Maximum Beauty of an Array After Applying Operation
[LeetCode](https://leetcode.com/problems/maximum-beauty-of-an-array-after-applying-operation)

> **Problem:** You may change each element once to any value in `[nums[i]-k, nums[i]+k]`. Return the longest subsequence of equal elements you can get.

**Insight:** overlapping ranges `[x-k, x+k]` can all be made equal, so the answer is the largest set of overlapping ranges. For `x <= y` they can meet when `x + k >= y - k`, i.e. `y - x <= 2k`. After sorting, find the longest window with `max - min <= 2k`.

### Naive brute force — O(N² + N log N)

```cpp
class Solution {
public:
    int maximumBeauty(vector<int>& nums, int k) {
        int n = nums.size();
        sort(nums.begin(), nums.end());
        int maxlen = 0;
        for(int i = 0; i < n; i++){
            for(int j = i; j < n; j++){
                if(nums[j] - nums[i] <= 2*k){
                    int len = j-i+1;
                    maxlen = max(maxlen, len);
                }
            }
        }
        return maxlen;
    }
};
```

### Sliding window — O(N + N) + O(N log N) for sorting

```cpp
class Solution {
public:
    int maximumBeauty(vector<int>& nums, int k) {
        int n = nums.size();
        sort(nums.begin(), nums.end());
        int maxlen = 0;
        int r = 0, l = 0;

        while(r < n){
            while(nums[r] - nums[l] > 2*k){
                l++;
            }
            if(nums[r] - nums[l] <= 2*k){
                int len = r-l+1;
                maxlen = max(maxlen, len);
            }
            r++;
        }
        return maxlen;
    }
};
```

### O(N) window (replace `while` with `if`) + O(N log N) sorting

```cpp
class Solution {
public:
    int maximumBeauty(vector<int>& nums, int k) {
        int n = nums.size();
        sort(nums.begin(), nums.end());
        int maxlen = 0;
        int r = 0, l = 0;

        while(r < n){
            if(nums[r] - nums[l] > 2*k){
                l++;
            }
            if(nums[r] - nums[l] <= 2*k){
                int len = r-l+1;
                maxlen = max(maxlen, len);
            }
            r++;
        }
        return maxlen;
    }
};
```

## Adding Spaces to a String
[LeetCode](https://leetcode.com/problems/adding-spaces-to-a-string/) · Two pointers

> **Problem:** Insert a space before each index listed in `spaces`, and return the new string.

```cpp
class Solution {
public:
    string addSpaces(string s, vector<int>& spaces) {
        if(spaces.empty()){
            return s;
        }

        int n = s.size(), m = spaces.size();
        int l = 0;
        int r = 0;
        string res;

        while(r < m && l < n){
            int ind = spaces[r] - 1;
            string newS = s.substr(l, ind-l+1);
            res += newS+" ";
            l = spaces[r];
            r++;
        }

        if(l < n){
            res += s.substr(l);
        }
        if (!res.empty() && res.back() == ' ') {
            res.pop_back();
        }
        return res;
    }
};
```

## Make String a Subsequence Using Cyclic Increments
[LeetCode](https://leetcode.com/problems/make-string-a-subsequence-using-cyclic-increments)

> **Problem:** Pick any set of indices in `str1` and increment each of those characters cyclically (z→a) at most once. Return whether `str2` can become a subsequence of `str1`.

### Top-down (Memory Limit Exceeded from recursion stack)

```cpp
class Solution {
public:
    bool canMakeSubsequence(string str1, string str2) {
        int n = str1.length();
        int m = str2.length();
        vector<vector<int>> dp(n, vector<int>(m, -1));
        return f(0, 0, str1, str2, dp);
    }

    bool f(int i, int j, string str1, string str2, vector<vector<int>>& dp) {
        int n = str1.length(), m = str2.length();

        if (i == n && j < m)
            return false;
        if (j == m)
            return true;

        if(dp[i][j] != -1)
            return dp[i][j];

        bool change = false;
        // try to change the current character in str1 to its cyclic next
        if (str1[i] == 'z' && str2[j] == 'a') {
            change = f(i + 1, j + 1, str1, str2, dp);
        } else if ((str1[i] + 1 == str2[j]) || str1[i] == str2[j]) {
            change = f(i + 1, j + 1, str1, str2, dp);
        }

        bool not_change = f(i + 1, j, str1, str2, dp);
        return dp[i][j] = (change || not_change);
    }
};
```

Bottom-up tabulation would also TLE because it is O(m·n).

### Single-pass two pointers — O(m + n)

```cpp
class Solution {
public:
    bool canMakeSubsequence(string str1, string str2) {
        int n = str1.length(), m = str2.length();
        int i = 0;
        int j = 0;

        while(i < n && j < m){
            if(str1[i] == str2[j] || str1[i] + 1 == str2[j] || str1[i] - 25 == str2[j]){
                j++;
            }
            i++;
        }
        return j == m;
    }
};
```

## Move Pieces to Obtain a String
[LeetCode](https://leetcode.com/problems/move-pieces-to-obtain-a-string)

> **Problem:** `L` pieces can only move left and `R` pieces only right, each into blank `_` cells. Return whether `start` can become `target`.

```cpp
class Solution {
public:
    bool canChange(string start, string target) {
        int n = start.length();
        int i = 0;
        int j = 0;

        while (i < n || j < n) {
            while(i < n && start[i] == '_') i++;
            while(j < n && target[j] == '_') j++;

            if (i == n ||j == n){
                return i == n && j == n;
            }

            if (start[i] != target[j] || (start[i] == 'L' && i < j) || (start[i] == 'R' && i > j)) {
                return false;
            }
            i++;
            j++;
        }
        return true;
    }
};
```

## Find Longest Special Substring That Occurs Thrice I
[LeetCode](https://leetcode.com/problems/find-longest-special-substring-that-occurs-thrice-i)

> **Problem:** A special string is made of a single repeated character. Return the length of the longest special substring that occurs at least three times, or -1.

Brute force works for the constraints: count every single-character run substring.

```cpp
class Solution {
public:
    int maximumLength(string s) {
        int n = s.length();
        unordered_map<string, int> mp;
        for(int start = 0; start < n; start++){
            string curr;
            for(int end = start; end < n; end++){
                if(curr.empty() || s[end] == curr.back()){
                    curr.push_back(s[end]);
                    mp[curr]++;
                }
                else{
                    break;
                }
            }
        }

        int ans = 0;
        for(auto i : mp){
            string str = i.first;
            if(i.second >= 3 && str.length() > ans) ans = str.length();
        }
        if(ans == 0) return -1;
        return ans;
    }
};
```
