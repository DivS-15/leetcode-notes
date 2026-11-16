## Ceil The Floor
[Naukri Code 360](https://www.naukri.com/code360/problems/ceiling-in-a-sorted-array_1825401)

> **Problem:** Given a sorted array `a` and an integer `x`, return the floor (largest element ≤ x) and the ceil (smallest element ≥ x). Use -1 when one doesn't exist.

Two binary searches: one for the floor (largest `<= x`), one for the ceil (smallest `>= x`).
```cpp
pair<int, int> getFloorAndCeil(vector<int> &a, int n, int x) {
    int floor = -1, ceil = -1;
    int low = 0, high = n-1;
    while(low <= high){
        int mid = (low+high)/2;
        if(a[mid] <= x){
            floor = a[mid];
            low = mid+1;
        }
        else high = mid-1;
    }
    low = 0, high = n-1;
    while(low <= high){
        int mid = (low+high)/2;
        if(a[mid] >= x){
            ceil = a[mid];
            high = mid-1;
        }
        else low = mid+1;
    }
    return {floor, ceil};
}
```
## Find First and Last Position of Element in Sorted Array
[LeetCode](https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/)

> **Problem:** Given a non-decreasing array `nums` and a `target`, return the first and last index of `target`, or `[-1, -1]` if it's absent. Must run in O(log n).

### Using lower_bound / upper_bound
```cpp
class Solution {
public:
    vector<int> searchRange(vector<int>& nums, int target) {
        int lb = lower_bound(nums.begin(), nums.end(), target) - nums.begin();
        if(lb == nums.size() || nums[lb] != target) return {-1, -1};
        int ub = upper_bound(nums.begin(), nums.end(), target) - nums.begin();
        return {lb, ub-1};
    }
};
```
### Manual binary search
```cpp
class Solution {
public:
    int first(vector<int>& nums, int target){
        int low = 0, high = nums.size()-1, ans = -1;
        while(low <= high){
            int mid = (low+high)/2;
            if(nums[mid] == target){
                ans = mid;
                high = mid-1;
            }
            else if(nums[mid] < target) low = mid+1;
            else high = mid-1;
        }
        return ans;
    }
    int last(vector<int>& nums, int target){
        int low = 0, high = nums.size()-1, ans = -1;
        while(low <= high){
            int mid = (low+high)/2;
            if(nums[mid] == target){
                ans = mid;
                low = mid+1;
            }
            else if(nums[mid] < target) low = mid+1;
            else high = mid-1;
        }
        return ans;
    }
    vector<int> searchRange(vector<int>& nums, int target) {
        int f = first(nums, target);
        if(f == -1) return {-1, -1};
        return {f, last(nums, target)};
    }
};
```
## Search in Rotated Sorted Array
[LeetCode](https://leetcode.com/problems/search-in-rotated-sorted-array/)

> **Problem:** A sorted array of distinct integers was rotated at an unknown pivot. Return the index of `target`, or -1 if it's not there, in O(log n).

Find which half is sorted, then check whether the target lies in it.
```cpp
class Solution {
public:
    int search(vector<int>& nums, int target) {
        int low = 0, high = nums.size()-1;
        while(low <= high){
            int mid = (low+high)/2;
            if(nums[mid] == target) return mid;
            if(nums[low] <= nums[mid]){
                if(nums[low] <= target && target <= nums[mid]) high = mid-1;
                else low = mid+1;
            }
            else{
                if(nums[mid] <= target && target <= nums[high]) low = mid+1;
                else high = mid-1;
            }
        }
        return -1;
    }
};
```
## Search in Rotated Sorted Array II
[LeetCode](https://leetcode.com/problems/search-in-rotated-sorted-array-ii/)

> **Problem:** Same as Search in Rotated Sorted Array, but the array may contain duplicates. Return `true` if `target` is present.

- Same as above, but when `nums[low] == nums[mid] == nums[high]` we can't tell which half is sorted, so shrink both ends.
- Worst case O(n/2), average O(log N).
```cpp
class Solution {
public:
    bool search(vector<int>& nums, int target) {
        int low = 0, high = nums.size()-1;
        while(low <= high){
            int mid = (low+high)/2;
            if(nums[mid] == target) return true;
            if(nums[mid] == nums[low] && nums[mid] == nums[high]){
                low++;
                high--;
                continue;
            }
            if(nums[low] <= nums[mid]){
                if(nums[low] <= target && target <= nums[mid]) high = mid-1;
                else low = mid+1;
            }
            else{
                if(nums[mid] <= target && target <= nums[high]) low = mid+1;
                else high = mid-1;
            }
        }
        return false;
    }
};
```
## Find Minimum in Rotated Sorted Array
[LeetCode](https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/)

> **Problem:** Given a rotated sorted array of unique elements, return its minimum element in O(log n).

Take the minimum of the sorted half, then discard that half.
```cpp
class Solution {
public:
    int findMin(vector<int>& nums) {
        int low = 0, high = nums.size()-1;
        int ans = INT_MAX;
        while(low <= high){
            int mid = (low+high)/2;
            if(nums[low] <= nums[mid]){
                ans = min(ans, nums[low]);
                low = mid+1;
            }
            else{
                ans = min(ans, nums[mid]);
                high = mid-1;
            }
        }
        return ans;
    }
};
```
## Find Minimum in Rotated Sorted Array II
[LeetCode](https://leetcode.com/problems/find-minimum-in-rotated-sorted-array-ii/)

> **Problem:** Given a rotated sorted array that may contain duplicates, return its minimum element.

First code with unique elements in mind, then optimise for duplicates.
```cpp
class Solution {
public:
    int findMin(vector<int>& nums) {
        int low = 0, high = nums.size()-1;
        int ans = INT_MAX;
        while(low <= high){
            int mid = (low+high)/2;
            if(nums[low] == nums[high]){
                ans = min(ans, nums[low]);
                low++;
                high--;
                continue;
            }
            if(nums[low] <= nums[mid]){
                ans = min(ans, nums[low]);
                low = mid+1;
            }
            else{
                ans = min(ans, nums[mid]);
                high = mid-1;
            }
        }
        return ans;
    }
};
```
## Find Kth Rotation
[GeeksforGeeks](https://www.geeksforgeeks.org/problems/rotation4723/1)

> **Problem:** Given a sorted array of distinct elements that was right-rotated `k` times, find `k`. That is the index of the minimum element.

Same as Find Minimum in Rotated Sorted Array; the index of the minimum is the rotation count.
```cpp
class Solution {
public:
    int findKRotation(vector<int> &arr) {
        int low = 0, high = arr.size()-1;
        int ans = INT_MAX, idx = -1;
        while(low <= high){
            int mid = (low+high)/2;
            if(arr[low] <= arr[mid]){
                if(arr[low] < ans){
                    ans = arr[low];
                    idx = low;
                }
                low = mid+1;
            }
            else{
                if(arr[mid] < ans){
                    ans = arr[mid];
                    idx = mid;
                }
                high = mid-1;
            }
        }
        return idx;
    }
};
```
## Single Element in a Sorted Array
[LeetCode](https://leetcode.com/problems/single-element-in-a-sorted-array/)

> **Problem:** In a sorted array every element appears exactly twice except one, which appears once. Find it in O(log n) time and O(1) space.

- Handle the edges separately (n == 1, first element, last element) so `mid-1` and `mid+1` are always valid.
- Before the single element, pairs start at an even index: (even, odd).
- After the single element, pairs start at an odd index: (odd, even).
- If `mid` is in the left part, the single element is on the right: eliminate the left half. Otherwise eliminate the right half.
```cpp
class Solution {
public:
    int singleNonDuplicate(vector<int>& nums) {
        int n = nums.size();
        if(n == 1) return nums[0];
        if(nums[0] != nums[1]) return nums[0];
        if(nums[n-1] != nums[n-2]) return nums[n-1];
        int low = 1, high = n-2;
        while(low <= high){
            int mid = (low+high)/2;
            if(nums[mid] != nums[mid-1] && nums[mid] != nums[mid+1]) return nums[mid];
            if((mid%2 == 1 && nums[mid-1] == nums[mid]) || (mid%2 == 0 && nums[mid+1] == nums[mid])){
                low = mid+1;
            }
            else high = mid-1;
        }
        return -1;
    }
};
```
## Find Peak Element
[LeetCode](https://leetcode.com/problems/find-peak-element/)

> **Problem:** A peak is an element strictly greater than its neighbours, with `nums[-1] = nums[n] = -∞`. Return the index of any peak in O(log n). Adjacent elements are never equal.

```cpp
class Solution {
public:
    int findPeakElement(vector<int>& nums) {
        int n = nums.size();
        if(n == 1) return 0;
        if(nums[0] > nums[1]) return 0;
        if(nums[n-1] > nums[n-2]) return n-1;
        int low = 1, high = n-2;
        while(low <= high){
            int mid = (low+high)/2;
            if(nums[mid] > nums[mid-1] && nums[mid] > nums[mid+1]) return mid;
            if(nums[mid] < nums[mid-1] && nums[mid] > nums[mid+1]) high = mid-1;
            else low = mid+1;
        }
        return -1;
    }
};
```
## Sqrt(x)
[LeetCode](https://leetcode.com/problems/sqrtx/)

> **Problem:** Given a non-negative integer `x`, return its square root rounded down, without using a built-in power or sqrt function.

```cpp
class Solution {
public:
    int mySqrt(int x) {
        long long low = 1, high = x, ans = 0;
        while(low <= high){
            long long mid = low + ((high-low)>>1);
            if(mid*mid <= x){
                ans = mid;
                low = mid+1;
            }
            else high = mid-1;
        }
        return ans;
    }
};
```
## Find Nth Root Of M
[Naukri Code 360](https://www.naukri.com/code360/problems/nth-root-of-m_1062679)

> **Problem:** Given `n` and `m`, return the integer `x` such that `x^n = m`, or -1 if no such integer exists.

`func` returns 2 if `mid^n > m`, 1 if `mid^n == m`, 0 otherwise. It stops early to avoid overflow.
```cpp
int func(int mid, int n, int m){
    long long ans = 1;
    for(int i = 1; i <= n; i++){
        ans = ans*mid;
        if(ans > m) return 2;
    }
    if(ans == m) return 1;
    return 0;
}
int NthRoot(int n, int m) {
    int low = 1, high = m;
    while(low <= high){
        int mid = (low+high)/2;
        int res = func(mid, n, m);
        if(res == 1) return mid;
        else if(res == 2) high = mid-1;
        else low = mid+1;
    }
    return -1;
}
```
## Koko Eating Bananas
[LeetCode](https://leetcode.com/problems/koko-eating-bananas/)

> **Problem:** Koko has `piles` of bananas and `h` hours. Each hour she picks one pile and eats up to `k` bananas from it. Return the minimum integer speed `k` that lets her finish all piles within `h` hours.

TC: O(N·log M), where M is the largest pile.
```cpp
class Solution {
public:
    long long func(vector<int>& piles, int mid){
        long long total = 0;
        for(int num : piles){
            total += ceil((double)num/mid);
        }
        return total;
    }
    int minEatingSpeed(vector<int>& piles, int h) {
        sort(piles.begin(), piles.end());
        int low = 1, high = piles.back();
        while(low <= high){
            int mid = (low+high)/2;
            if(func(piles, mid) <= h) high = mid-1;
            else low = mid+1;
        }
        return low;
    }
};
```
## Minimum Number of Days to Make m Bouquets
[LeetCode](https://leetcode.com/problems/minimum-number-of-days-to-make-m-bouquets/)

> **Problem:** `bloomDay[i]` is the day flower `i` blooms. A bouquet needs `k` adjacent bloomed flowers. Return the minimum number of days needed to make `m` bouquets, or -1 if it's impossible.

TC: O(n log n + n log D), where D = max - min bloom day.
```cpp
class Solution {
public:
    bool isPossible(vector<int>& nums, int day, int m, int k){
        int count = 0;
        long long total = 0;
        for(int i = 0; i < nums.size(); i++){
            if(nums[i] <= day) count++;
            else{
                total += count/k;
                count = 0;
            }
        }
        total += count/k;
        return total >= m;
    }
    int minDays(vector<int>& bloomDay, int m, int k) {
        int n = bloomDay.size();
        if(n < (long long)m*k) return -1;
        vector<int> arr = bloomDay;
        sort(arr.begin(), arr.end());
        int low = arr[0], high = arr[n-1];
        while(low <= high){
            int mid = (low+high)/2;
            if(isPossible(bloomDay, mid, m, k)) high = mid-1;
            else low = mid+1;
        }
        return low;
    }
};
```
## Find the Smallest Divisor Given a Threshold
[LeetCode](https://leetcode.com/problems/find-the-smallest-divisor-given-a-threshold/)

> **Problem:** Choose a positive divisor, divide every element by it (rounding up), and sum the results. Return the smallest divisor whose sum is ≤ `threshold`.

TC: O(N·log(max)).
```cpp
class Solution {
public:
    int func(vector<int>& nums, int mid){
        int sum = 0;
        for(int num : nums){
            sum += ceil((double)num/mid);
        }
        return sum;
    }
    int smallestDivisor(vector<int>& nums, int threshold) {
        int low = 1, high = *max_element(nums.begin(), nums.end());
        while(low <= high){
            int mid = (low+high)/2;
            if(func(nums, mid) <= threshold) high = mid-1;
            else low = mid+1;
        }
        return low;
    }
};
```
## Capacity To Ship Packages Within D Days
[LeetCode](https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/)

> **Problem:** Packages must ship in the given order, one day's load at a time, and a day's load can't exceed the ship's capacity. Return the least capacity that ships everything within `days` days.

Search the capacity between the heaviest package and the total weight.
```cpp
class Solution {
public:
    int daysRequiredCap(vector<int>& weights, int cap){
        int days = 1, load = 0;
        for(int weight : weights){
            if(weight + load > cap){
                days++;
                load = weight;
            }
            else load += weight;
        }
        return days;
    }
    int shipWithinDays(vector<int>& weights, int days) {
        int low = *max_element(weights.begin(), weights.end());
        int high = accumulate(weights.begin(), weights.end(), 0);
        while(low <= high){
            int mid = (low+high)/2;
            if(daysRequiredCap(weights, mid) <= days) high = mid-1;
            else low = mid+1;
        }
        return low;
    }
};
```
## Kth Missing Positive Number
[LeetCode](https://leetcode.com/problems/kth-missing-positive-number/)

> **Problem:** Given a strictly increasing array of positive integers `arr` and an integer `k`, return the `k`-th positive integer missing from `arr`.

### Brute force, O(N)
```cpp
class Solution {
public:
    int findKthPositive(vector<int>& arr, int k) {
        for(int num : arr){
            if(num <= k) k++;
            else break;
        }
        return k;
    }
};
```
### Binary search, O(log n)
Numbers missing before index `mid` = `arr[mid] - (mid+1)`.
```cpp
class Solution {
public:
    int findKthPositive(vector<int>& arr, int k) {
        int low = 0, high = arr.size()-1;
        while(low <= high){
            int mid = (low+high)/2;
            int missing = arr[mid] - (mid+1);
            if(missing < k) low = mid+1;
            else high = mid-1;
        }
        return high + k + 1;
    }
};
```
## Aggressive Cows
[Naukri Code 360](https://www.naukri.com/code360/problems/aggressive-cows_1082559)

> **Problem:** Given stall positions and `k` cows, place the cows in stalls so that the minimum distance between any two cows is as large as possible. Return that distance.

TC: O(N log N) overall (sorting plus binary search on the distance).
```cpp
bool canPlace(vector<int> &stalls, int dist, int k){
    int count = 1, last = stalls[0];
    for(int i = 1; i < stalls.size(); i++){
        if(stalls[i] - last >= dist){
            count++;
            if(count >= k) return true;
            last = stalls[i];
        }
    }
    return false;
}
int aggressiveCows(vector<int> &stalls, int k) {
    sort(stalls.begin(), stalls.end());
    int low = 1, high = stalls.back() - stalls.front();
    while(low <= high){
        int mid = (low+high)/2;
        if(canPlace(stalls, mid, k)) low = mid+1;
        else high = mid-1;
    }
    return high;
}
```
## Allocate Books
[Naukri Code 360](https://www.naukri.com/code360/problems/allocate-books_1090540)

> **Problem:** Given `n` books with page counts and `m` students, give each student a contiguous block of books (at least one each). Minimise the maximum pages any student gets. Return -1 if `m > n`.

TC: O(N·log(Sum-Max+1)).
```cpp
int func(vector<int>& arr, int pages){
    int students = 1;
    long long pagesStudent = 0;
    for(int i = 0; i < arr.size(); i++){
        if(pagesStudent + arr[i] <= pages) pagesStudent += arr[i];
        else{
            students++;
            pagesStudent = arr[i];
        }
    }
    return students;
}
int findPages(vector<int>& arr, int n, int m) {
    if(m > n) return -1;
    int low = *max_element(arr.begin(), arr.end());
    int high = accumulate(arr.begin(), arr.end(), 0);
    while(low <= high){
        int mid = (low+high)/2;
        if(func(arr, mid) > m) low = mid+1;
        else high = mid-1;
    }
    return low;
}
```
## Painter's Partition Problem
[Naukri Code 360](https://www.naukri.com/code360/problems/painter-s-partition-problem_1089557)

> **Problem:** Given board lengths and `k` painters, each painter paints a contiguous run of boards at one unit per unit time. Return the minimum time to paint all boards.

**Understanding the Binary Search Approach**
- Low = the longest board (a painter must paint at least one whole board).
- High = sum of all boards (one painter paints everything).
- Mid = candidate for the minimum possible maximum time.
- If the painters needed are ≤ k, try a smaller time: move high to mid-1. Otherwise move low to mid+1.
```cpp
int countPainters(vector<int> &boards, int time){
    int painters = 1;
    long long boardsPainter = 0;
    for(int i = 0; i < boards.size(); i++){
        if(boardsPainter + boards[i] <= time) boardsPainter += boards[i];
        else{
            painters++;
            boardsPainter = boards[i];
        }
    }
    return painters;
}
int findLargestMinDistance(vector<int> &boards, int k) {
    int low = *max_element(boards.begin(), boards.end());
    int high = accumulate(boards.begin(), boards.end(), 0);
    int result = -1;
    while(low <= high){
        int mid = (low+high)/2;
        if(countPainters(boards, mid) <= k){
            result = mid;
            high = mid-1;
        }
        else low = mid+1;
    }
    return result;
}
```
## Split Array Largest Sum
[LeetCode](https://leetcode.com/problems/split-array-largest-sum/)

> **Problem:** Split `nums` into `k` non-empty contiguous subarrays so the largest subarray sum is minimised. Return that minimised largest sum.

Same as Painter's partition.
```cpp
class Solution {
public:
    int countIfPossible(vector<int>& nums, int maxSum){
        int count = 1;
        long long sum = 0;
        for(int num : nums){
            if(sum + num <= maxSum) sum += num;
            else{
                count++;
                sum = num;
            }
        }
        return count;
    }
    int splitArray(vector<int>& nums, int k) {
        int low = *max_element(nums.begin(), nums.end());
        int high = accumulate(nums.begin(), nums.end(), 0);
        while(low <= high){
            int mid = (low+high)/2;
            if(countIfPossible(nums, mid) <= k) high = mid-1;
            else low = mid+1;
        }
        return low;
    }
};
```
## Minimize Max Distance to Gas Station
[Naukri Code 360](https://www.naukri.com/code360/problems/minimise-max-distance_7541449)

> **Problem:** Given sorted gas station positions, add `k` new stations anywhere (not necessarily at integer positions). Minimise the maximum distance between adjacent stations and return it.

### Priority queue
TC: O(NLogN + KLogN). Always put the next station into the currently largest gap.
```cpp
double minimiseMaxDistance(vector<int> &arr, int k){
    int n = arr.size();
    vector<int> howMany(n-1, 0);
    priority_queue<pair<long double, int>> pq;
    for(int i = 0; i < n-1; i++){
        pq.push({arr[i+1]-arr[i], i});
    }
    for(int gasStations = 1; gasStations <= k; gasStations++){
        auto tp = pq.top(); pq.pop();
        int idx = tp.second;
        howMany[idx]++;
        long double iniDiff = arr[idx+1] - arr[idx];
        long double newSecLen = iniDiff / (long double)(howMany[idx]+1);
        pq.push({newSecLen, idx});
    }
    return pq.top().first;
}
```
### Binary search on the answer
TC: O(NLogN + N), SC: O(1). See video "BS-20".
```cpp
int canPlace(vector<int> &arr, long double dist){
    int count = 0;
    for(int i = 1; i < arr.size(); i++){
        long double gap = arr[i] - arr[i-1];
        if(gap > dist){
            count += ceil(gap/dist) - 1;
        }
    }
    return count;
}
double minimiseMaxDistance(vector<int> &arr, int k){
    int n = arr.size();
    long double low = 0, high = 0;
    for(int i = 0; i < n-1; i++){
        high = max(high, (long double)(arr[i+1]-arr[i]));
    }
    long double diff = 1e-6;
    while(high - low > diff){
        long double mid = (low+high)/2.0;
        if(canPlace(arr, mid) > k) low = mid;
        else high = mid;
    }
    return high;
}
```
## Median of Two Sorted Arrays
[LeetCode](https://leetcode.com/problems/median-of-two-sorted-arrays/)

> **Problem:** Given two sorted arrays of sizes `m` and `n`, return the median of the combined array in O(log(m+n)).

### Brute force merge, O(m+n)
```cpp
class Solution {
public:
    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
        vector<int> merged;
        int i = 0, j = 0;
        while(i < nums1.size() && j < nums2.size()){
            if(nums1[i] < nums2[j]) merged.push_back(nums1[i++]);
            else merged.push_back(nums2[j++]);
        }
        while(i < nums1.size()) merged.push_back(nums1[i++]);
        while(j < nums2.size()) merged.push_back(nums2[j++]);
        int n = merged.size();
        if(n%2 == 1) return merged[n/2];
        return (merged[n/2-1] + merged[n/2])/2.0;
    }
};
```
### Binary search on the partition, O(log(min(n1,n2)))
See video "BS-21". Binary search how many elements of the smaller array go into the left half.
```cpp
class Solution {
public:
    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
        int n1 = nums1.size(), n2 = nums2.size();
        if(n1 > n2) return findMedianSortedArrays(nums2, nums1);
        int low = 0, high = n1;
        int left = (n1+n2+1)/2;
        int n = n1+n2;
        while(low <= high){
            int mid1 = (low+high)/2;
            int mid2 = left - mid1;
            int l1 = INT_MIN, l2 = INT_MIN;
            int r1 = INT_MAX, r2 = INT_MAX;
            if(mid1 < n1) r1 = nums1[mid1];
            if(mid2 < n2) r2 = nums2[mid2];
            if(mid1-1 >= 0) l1 = nums1[mid1-1];
            if(mid2-1 >= 0) l2 = nums2[mid2-1];
            if(l1 <= r2 && l2 <= r1){
                if(n%2 == 1) return max(l1, l2);
                return (max(l1, l2) + min(r1, r2))/2.0;
            }
            else if(l1 > r2) high = mid1-1;
            else low = mid1+1;
        }
        return 0;
    }
};
```
## K-th Element of Two Sorted Arrays
[Naukri Code 360](https://www.naukri.com/code360/problems/k-th-element-of-2-sorted-array_1164159)

> **Problem:** Given two sorted arrays, return the `k`-th smallest element of their union.

Same partition idea as the median, with `k` elements on the left.
```cpp
int kthElement(vector<int> &a, vector<int> &b, int n1, int n2, int k){
    if(n1 > n2) return kthElement(b, a, n2, n1, k);
    int low = max(0, k-n2), high = min(k, n1);
    int left = k;
    while(low <= high){
        int mid1 = (low+high)/2;
        int mid2 = left - mid1;
        int l1 = INT_MIN, l2 = INT_MIN;
        int r1 = INT_MAX, r2 = INT_MAX;
        if(mid1 < n1) r1 = a[mid1];
        if(mid2 < n2) r2 = b[mid2];
        if(mid1-1 >= 0) l1 = a[mid1-1];
        if(mid2-1 >= 0) l2 = b[mid2-1];
        if(l1 <= r2 && l2 <= r1) return max(l1, l2);
        else if(l1 > r2) high = mid1-1;
        else low = mid1+1;
    }
    return 0;
}
```
## Row with Maximum 1's
[Naukri Code 360](https://www.naukri.com/code360/problems/row-of-a-matrix-with-maximum-ones_982768)

> **Problem:** Given a binary matrix whose rows are sorted, return the index of the row with the most 1s (the lowest index on ties), or -1 if there are no 1s.

O(n log m). Each row is sorted, so the lower bound of 1 gives the count of ones.
```cpp
int lowerBound(vector<int> &arr, int n, int x){
    int low = 0, high = n-1, ans = n;
    while(low <= high){
        int mid = (low+high)/2;
        if(arr[mid] >= x){
            ans = mid;
            high = mid-1;
        }
        else low = mid+1;
    }
    return ans;
}
int rowWithMax1s(vector<vector<int>> &matrix, int n, int m){
    int maxCount = 0, index = -1;
    for(int i = 0; i < n; i++){
        int num = m - lowerBound(matrix[i], m, 1);
        if(num > maxCount){
            maxCount = num;
            index = i;
        }
    }
    return index;
}
```
## Search a 2D Matrix
[LeetCode](https://leetcode.com/problems/search-a-2d-matrix/)

> **Problem:** Every row of the matrix is sorted, and each row's first element is greater than the previous row's last. Return whether `target` is in the matrix, in O(log(m·n)).

O(log(m·n)). Treat the matrix as one flattened sorted array.
```cpp
class Solution {
public:
    bool searchMatrix(vector<vector<int>>& matrix, int target) {
        int n = matrix.size(), m = matrix[0].size();
        int low = 0, high = n*m - 1;
        while(low <= high){
            int mid = (low+high)/2;
            int row = mid/m, col = mid%m;
            if(matrix[row][col] == target) return true;
            else if(matrix[row][col] < target) low = mid+1;
            else high = mid-1;
        }
        return false;
    }
};
```
## Search a 2D Matrix II
[LeetCode](https://leetcode.com/problems/search-a-2d-matrix-ii/)

> **Problem:** Each row is sorted left to right and each column top to bottom. Return whether `target` is in the matrix.

### Binary search each row, O(N log M)
```cpp
class Solution {
public:
    bool searchMatrix(vector<vector<int>>& matrix, int target) {
        for(auto &row : matrix){
            if(row.front() <= target && target <= row.back()){
                auto it = lower_bound(row.begin(), row.end(), target);
                if(it != row.end() && *it == target) return true;
            }
        }
        return false;
    }
};
```
### Staircase, O(N+M)
Start at the top-right corner.
```cpp
class Solution {
public:
    bool searchMatrix(vector<vector<int>>& matrix, int target) {
        int n = matrix.size(), m = matrix[0].size();
        int row = 0, col = m-1;
        while(row < n && col >= 0){
            if(matrix[row][col] == target) return true;
            else if(matrix[row][col] < target) row++;
            else col--;
        }
        return false;
    }
};
```
## Find a Peak Element II
[LeetCode](https://leetcode.com/problems/find-a-peak-element-ii/)

> **Problem:** In a matrix where no two adjacent cells are equal, find any cell strictly greater than its four neighbours (the border counts as -1). Return `[row, col]` in O(m log n) or O(n log m).

O(N log M). Binary search over columns; in the middle column take the row of the max element and compare it with its left and right neighbours.
```cpp
class Solution {
public:
    int MaxInCol(vector<vector<int>>& mat, int n, int col){
        int maxVal = -1, idx = -1;
        for(int i = 0; i < n; i++){
            if(mat[i][col] > maxVal){
                maxVal = mat[i][col];
                idx = i;
            }
        }
        return idx;
    }
    vector<int> findPeakGrid(vector<vector<int>>& mat) {
        int n = mat.size(), m = mat[0].size();
        int low = 0, high = m-1;
        while(low <= high){
            int mid = (low+high)/2;
            int row = MaxInCol(mat, n, mid);
            int left = mid-1 >= 0 ? mat[row][mid-1] : -1;
            int right = mid+1 < m ? mat[row][mid+1] : -1;
            if(mat[row][mid] > left && mat[row][mid] > right) return {row, mid};
            else if(mat[row][mid] < left) high = mid-1;
            else low = mid+1;
        }
        return {-1, -1};
    }
};
```
## Median in a row-wise sorted Matrix
[Naukri Code 360](https://www.naukri.com/code360/problems/median-of-a-row-wise-sorted-matrix_1115473)

> **Problem:** Given an `n × m` matrix (odd number of cells) whose rows are sorted, return the median of all its elements.

Binary search on the value; the median is the smallest value with more than `n*m/2` elements ≤ it.
```cpp
int countSmallEqual(vector<vector<int>> &matrix, int n, int m, int x){
    int cnt = 0;
    for(int i = 0; i < n; i++){
        cnt += upper_bound(matrix[i].begin(), matrix[i].end(), x) - matrix[i].begin();
    }
    return cnt;
}
int median(vector<vector<int>> &matrix, int n, int m) {
    int low = INT_MAX, high = INT_MIN;
    for(int i = 0; i < n; i++){
        low = min(low, matrix[i][0]);
        high = max(high, matrix[i][m-1]);
    }
    int req = (n*m)/2;
    while(low <= high){
        int mid = (low+high)/2;
        int smallEqual = countSmallEqual(matrix, n, m, mid);
        if(smallEqual > req) high = mid-1;
        else low = mid+1;
    }
    return low;
}
```
## Maximum Candies Allocated to K Children
[LeetCode](https://leetcode.com/problems/maximum-candies-allocated-to-k-children/)

> **Problem:** Piles of candies can be split into smaller piles but never merged. Give `k` children one pile each, all the same size. Return the largest size possible (0 if none).

```cpp
class Solution {
public:
    bool canAllocate(vector<int>& candies, long long k, int mid){
        long long count = 0;
        for(int candy : candies){
            count += candy/mid;
        }
        return count >= k;
    }
    int maximumCandies(vector<int>& candies, long long k) {
        int low = 0, high = *max_element(candies.begin(), candies.end());
        while(low < high){
            int mid = (low+high+1)/2;
            if(canAllocate(candies, k, mid)) low = mid;
            else high = mid-1;
        }
        return low;
    }
};
```
