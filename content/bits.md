## Minimum Bit Flips to Convert Number
[LeetCode](https://leetcode.com/problems/minimum-bit-flips-to-convert-number/)

> **Problem:** Return the minimum number of bit flips needed to turn `start` into `goal`.

Count set bits of `start ^ goal` (Kernighan's trick: `n & (n-1)` clears the lowest set bit).

```cpp
class Solution {
public:
    int minBitFlips(int start, int goal) {
        int n = start^goal;
        int count = 0;
        while(n != 0){
            n = n&(n-1);
            count++;
        }
        return count;
    }
};
```

## Subsets
[LeetCode](https://leetcode.com/problems/subsets/)

> **Problem:** Given an array of unique integers, return all possible subsets (the power set), with no duplicate subsets.

### Backtracking

```cpp
class Solution {
public:
    vector<vector<int>> output;
    int n, k;
    vector<vector<int>> subsets(vector<int>& nums) {
        n = nums.size();
        for(k = 0; k < n+1; k++){
            vector<int> curr;
            backtrack(0, curr, nums);
        }
        return output;
    }

    void backtrack(int idx, vector<int>& curr, vector<int>& nums){
        if(curr.size() == k) output.push_back(curr);

        for(int i = idx; i < n; i++){
            curr.push_back(nums[i]);
            backtrack(i+1, curr, nums);
            curr.pop_back();
        }
    }
};
```

### Bit masking

```cpp
class Solution {
public:
    vector<vector<int>> subsets(vector<int>& nums) {
        int n = nums.size();
        int subsets = (1 << n);

        vector<vector<int>> res;
        for(int num = 0; num <= subsets-1 ; num++){
            vector<int> ans = {};
            for(int i = 0; i < n; i++){
                // check if the ith bit is set in the current number
                if(num & (1 << i)){
                    ans.push_back(nums[i]);
                }
            }
            res.push_back(ans);
        }
        return res;
    }
};
```

## Single Number
[LeetCode](https://leetcode.com/problems/single-number/)

> **Problem:** Every element appears twice except one. Find that single element in O(n) time and O(1) extra space.

```cpp
int singleNumber(vector<int>& nums) {
    int ans = 0;
    for(int num: nums){
        ans = ans^num;
    }
    return ans;
}
```

## Single Number II
[LeetCode](https://leetcode.com/problems/single-number-ii/)

> **Problem:** Every element appears three times except one, which appears once. Find it in O(n) time and O(1) extra space.

### Count each bit — O(N·32)

```cpp
class Solution {
public:
    int singleNumber(vector<int>& nums) {
        int ans = 0;
        int n = nums.size();

        for(int bitIndex = 0; bitIndex < 32; bitIndex++){
            int count = 0;
            for(int i = 0; i < n; i++){
                if(nums[i] & (1 << bitIndex))
                    count++;
            }
            if(count%3 == 1){
                ans = ans | (1 << bitIndex);
            }
        }
        return ans;
    }
};
```

### Sort — O(N log N)

```cpp
int singleNumber(vector<int>& nums) {
    int n = nums.size();
    sort(nums.begin(), nums.end());
    for(int i = 1; i < n; i += 3){
        if(nums[i] != nums[i-1]){
            return nums[i-1];
        }
    }
    return nums[n-1];
}
```

### Ones/twos buckets — O(N) time, O(1) space

```cpp
class Solution {
public:
    int singleNumber(vector<int>& nums) {
        int ones = 0, twos = 0;
        for(int num : nums){
            ones = (ones^num) & (~ twos);
            twos = (twos^num) & (~ ones);
        }
        return ones;
    }
};
```

## Single Number III
[LeetCode](https://leetcode.com/problems/single-number-iii/)

> **Problem:** Exactly two elements appear once and all others appear twice. Return the two single elements in O(n) time and O(1) extra space.

XOR everything; the lowest set bit of the result separates the two unique numbers into two groups.

```cpp
class Solution {
public:
    vector<int> singleNumber(vector<int>& nums) {
        long xorr = 0;
        for(int num: nums){
            xorr ^= num;
        }

        long rightmost = xorr ^ (xorr & (xorr-1)); // the number with only the rightmost set bit

        long b1 = 0, b2 = 0;
        for(long num: nums){
            if(num & rightmost)
                b1 = b1^num;
            else b2 ^= num;
        }
        return {(int) b1, (int) b2};
    }
};
```

## XOR Queries of a Subarray
[LeetCode](https://leetcode.com/problems/xor-queries-of-a-subarray/)

> **Problem:** For each query `[l, r]`, return `arr[l] XOR arr[l+1] XOR … XOR arr[r]`.

### Naive — O(q·n), TLE

```cpp
class Solution {
public:
    vector<int> xorQueries(vector<int>& arr, vector<vector<int>>& queries) {
        vector<int> ans;
        for(auto& query: queries){
            int left = query[0], right = query[1];
            int result = findXor(left, right, arr);
            ans.push_back(result);
        }
        return ans;
    }

    int findXor(int l, int r, vector<int>& arr){
        int xorr = 0;
        for(int i = l; i <= r; i++){
            xorr ^= arr[i];
        }
        return xorr;
    }
};
```

### Prefix XOR — O(q + n) time, O(n) space

```cpp
class Solution {
public:
    vector<int> xorQueries(vector<int>& arr, vector<vector<int>>& queries) {
        vector<int> ans;
        int n = arr.size();
        vector<int> prefixXor(n+1, 0);

        for(int i = 0; i < n; i++){
            prefixXor[i+1] = prefixXor[i]^arr[i];
        }

        for(auto& query: queries){
            int left = query[0];
            int right = query[1];
            ans.push_back(prefixXor[left]^prefixXor[right+1]);
        }
        return ans;
    }
};
```

### In-place prefix XOR — O(q + n) time, O(1) extra space

```cpp
class Solution {
public:
    vector<int> xorQueries(vector<int>& arr, vector<vector<int>>& queries) {
        vector<int> ans;
        int n = arr.size();

        for(int i = 1; i < n; i++){
            arr[i] = arr[i]^arr[i-1];
        }

        for(auto& q: queries){
            if(q[0] > 0){
                ans.push_back(arr[q[0]-1] ^ arr[q[1]]);
            }
            else{
                ans.push_back(arr[q[1]]);
            }
        }
        return ans;
    }
};
```

## Divide Two Integers
[LeetCode](https://leetcode.com/problems/divide-two-integers/)

> **Problem:** Divide `dividend` by `divisor` without using multiplication, division or mod, truncating toward zero. Clamp the result to the 32-bit signed range.

Subtract the largest `divisor · 2^cnt` that fits, repeatedly.

```cpp
class Solution {
public:
    int divide(int dividend, int divisor) {
        if(dividend == divisor)
            return 1;

        bool sign = true;
        if(dividend < 0 && divisor > 0) sign = false;
        else if(dividend >= 0 && divisor < 0) sign = false;

        unsigned long long n = abs((long long)dividend);
        unsigned long long d = abs((long long)divisor);

        long ans = 0;

        while(n >= d){
            int cnt = 0;
            while(n >= (d << (cnt+1))){
                cnt++;
            }
            ans += (1 << cnt); // add 2^cnt to the ans
            n -= (d<<cnt);
        }
        if((ans == 1<<31) && sign) return INT_MAX;
        if(ans == (1<<31) && !sign) return INT_MIN;

        return sign? ans : -ans;
    }
};
```
