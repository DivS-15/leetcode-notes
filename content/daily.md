## Different Ways to Add Parentheses
[LeetCode](https://leetcode.com/problems/different-ways-to-add-parentheses/)

> **Problem:** Given an expression of numbers and `+ - *`, return the results of every possible way to group it with parentheses.

No solution recorded in the notes.

## Extra Characters in a String
[LeetCode](https://leetcode.com/problems/extra-characters-in-a-string/description/)

> **Problem:** Break `s` into non-overlapping substrings that are words in `dictionary`. Characters not covered by any word are extra. Return the minimum number of extra characters.

Trie of dictionary words + memoized DP over start index.

```cpp
class TrieNode{
public:
    unordered_map<char, TrieNode*> children;
    bool is_word;
};

class Solution {
public:
    int minExtraChar(string s, vector<string>& dictionary) {
        int n = s.length();
        auto root = buildTrie(dictionary);
        unordered_map<int, int> memo;

        function<int(int)> dp = [&](int start){
            if(start == n){
                return 0;
            }
            if(memo.find(start) != memo.end()){
                return memo[start];
            }

            int ans = dp(start+1)+1;
            TrieNode* node = root;

            for(int end = start; end < n; end++){
                char c = s[end];
                if(node->children.find(c) == node->children.end()){
                    break;
                }
                node = node->children[c];
                if(node->is_word){
                    ans = min(ans, dp(end+1));
                }
            }
            return memo[start] = ans;
        };

        return dp(0);
    }

    TrieNode* buildTrie(vector<string>& dictionary){
        auto root = new TrieNode();
        for(auto& word: dictionary){
            auto node = root;
            for(auto& c: word){
                // if not already in trie
                if(node->children.find(c) == node->children.end()){
                    node->children[c] = new TrieNode();
                }
                node = node->children[c];
            }
            node->is_word = true;
        }
        return root;
    }
};
```

## Find the Length of the Longest Common Prefix
[LeetCode](https://leetcode.com/problems/find-the-length-of-the-longest-common-prefix/)

> **Problem:** Given two arrays of positive integers, return the length of the longest common digit-prefix between any `x` from `arr1` and any `y` from `arr2`.

Insert the digits of every number in `arr1` into a digit trie, then walk each number of `arr2`.

```cpp
class TrieNode{
public:
   TrieNode* children[10];
   TrieNode(){
       for(int i = 0 ; i < 10; ++i){
           children[i] = nullptr;
       }
   }
};

class Trie{
public:
   TrieNode* root;
   Trie(){
       root = new TrieNode();
   }

   void insert(int num){
       TrieNode* node = root;
       string numstr = to_string(num);
       for(char c: numstr){
           int idx = c - '0';
           if(!node->children[idx]){
               node->children[idx] = new TrieNode();
           }
           node = node->children[idx];
       }
   }

   int findLongestPrefix(int num){
       TrieNode* node = root;
       string numstr = to_string(num);
       int len = 0;
       for(char c: numstr){
           int idx = c - '0';
           if(node->children[idx]){
               len++;
               node = node->children[idx];
           } else{
               break;
           }
       }
       return len;
   }
};

class Solution {
public:
   int longestCommonPrefix(vector<int>& arr1, vector<int>& arr2) {
       Trie trie;
       for(int num: arr1){
           trie.insert(num);
       }
       int longestPrefix = 0;
       for(int num: arr2){
           int length = trie.findLongestPrefix(num);
           longestPrefix = max(longestPrefix, length);
       }
       return longestPrefix;
   }
};
```

## Sum of Prefix Scores of Strings
[LeetCode](https://leetcode.com/problems/sum-of-prefix-scores-of-strings/)

> **Problem:** The score of a string is the number of words that have it as a prefix. For each word, return the sum of the scores of all its non-empty prefixes.

Each trie node counts how many words pass through it; a word's score is the sum of counters along its path.

```cpp
class TrieNode{
public:
   int counter;
   unordered_map<char, TrieNode*> children;
   TrieNode() : counter(0) {}
};

class Solution {
public:
   vector<int> sumPrefixScores(vector<string>& words) {
       auto root = buildTrie(words);
       vector<int> ans;

       for(auto& word : words){
           auto node = root;
           int count = 0;
           for(auto& c: word){
               if(node->children.find(c) == node->children.end()){
                   break;
               }
               node=node->children[c];
               count += node->counter;
           }
           ans.push_back(count);
       }
       return ans;
   }

   TrieNode* buildTrie(vector<string>& words){
       auto root = new TrieNode();
       for(auto& word: words){
           auto node = root;
           for(auto& c: word){
               if(node->children.find(c) == node->children.end()){
                   node->children[c] = new TrieNode();
               }
               node=node->children[c];
               node->counter++;
           }
       }
       return root;
   }
};
```

## My Calendar II
[LeetCode](https://leetcode.com/problems/my-calendar-ii/)

> **Problem:** Implement a calendar where `book(start, end)` succeeds unless it would cause a triple booking (three events overlapping at once).

Line sweep over an ordered map of +1/−1 events; roll back the booking if overlap exceeds 2.

```cpp
class MyCalendarTwo {
public:
   map<int, int> bookingCount;
   int maxOverlapBooking;

   MyCalendarTwo() {
       maxOverlapBooking = 2;
   }

   bool book(int start, int end) {
       bookingCount[start]++;
       bookingCount[end]--;

       int overlapBooking = 0;
       for(auto& booking: bookingCount){
           overlapBooking += booking.second;
           if(overlapBooking > maxOverlapBooking){
               bookingCount[start]--;
               bookingCount[end]++;

               if(bookingCount[start] == 0){
                   bookingCount.erase(start);
               }
               if(bookingCount[end] == 0){
                   bookingCount.erase(end);
               }
               return false;
           }
       }
       return true;
   }
};
```

## My Calendar I
[LeetCode](https://leetcode.com/problems/my-calendar-i/) · [Solution walk-through](https://chatgpt.com/share/66f708b9-4268-800b-a5d2-84ee0ed56a0b)

> **Problem:** Implement a calendar where `book(start, end)` succeeds only if the half-open interval doesn't overlap any existing booking.

```cpp
class MyCalendar {
private:
   set<pair<int, int>> calendar;
public:
   MyCalendar() {}

   bool book(int start, int end) {
       const pair<int, int> event{start, end};
       const auto nextEvent = calendar.lower_bound(event);

       if(nextEvent != calendar.end() && nextEvent->first < end){
           return false;
       }
       if(nextEvent != calendar.begin()){
           const auto prevEvent = prev(nextEvent);
           if(prevEvent->second > start ){
               return false;
           }
       }
       calendar.insert(event);
       return true;
   }
};
```

## Make Sum Divisible by P
[LeetCode](https://leetcode.com/problems/make-sum-divisible-by-p/editorial/)

> **Problem:** Remove the smallest (possibly empty) subarray so the remaining sum is divisible by `p`. Return its length, or -1. Removing the whole array isn't allowed.

Use prefix sums so any subarray sum is O(1): `sum(i, j) = sum(0, j) - sum(0, i-1)`. That makes the whole solution O(n).

```cpp
class Solution {
public:
    int minSubarray(vector<int>& nums, int p) {
        int n = nums.size();
        int totalSum = 0;

        // Step 1: Calculate total sum and target remainder
        for (int num : nums) {
            totalSum = (totalSum + num) % p;
        }

        int target = totalSum % p;
        if (target == 0) return 0;  // The array is already divisible by p

        // Step 2: Use a hash map to track prefix sum mod p
        unordered_map<int, int> modMap;
        modMap[0] = -1;  // To handle the case where the whole prefix is the answer
        int currentSum = 0, minLen = n;

        // Step 3: Iterate over the array
        for (int i = 0; i < n; ++i) {
            currentSum = (currentSum + nums[i]) % p;

            // Calculate what we need to remove
            int needed = (currentSum - target + p) % p;

            // If we have seen the needed remainder, we can consider this subarray
            if (modMap.find(needed) != modMap.end()) {
                minLen = min(minLen, i - modMap[needed]);
            }

            // Store the current remainder and index
            modMap[currentSum] = i;
        }

        // Step 4: Return result
        return minLen == n ? -1 : minLen;
    }
};
```

## Divide Players Into Teams of Equal Skill
[LeetCode](https://leetcode.com/problems/divide-players-into-teams-of-equal-skill/description)

> **Problem:** Split players (even count) into teams of two with equal total skill. Return the sum of each team's skill product, or -1 if that's impossible.

```cpp
class Solution {
public:
    long long dividePlayers(vector<int>& skill) {
        long long sum = 0;
        int n = skill.size();
        for(int num: skill){
            sum += num;
        }

        // Each pair should sum up to 'target'
        if(n % 2 != 0) return -1; // If odd number of players, can't form pairs
        long long target = sum / (n / 2);

        // If the total sum isn't divisible by (n/2), it's impossible to form valid pairs
        if(target * (n / 2) != sum) return -1;

        // Count the frequency of each skill
        unordered_map<int, int> count;
        for(int num: skill){
            count[num]++;
        }

        long long result = 0;

        for(auto& [skill_val, freq] : count){
            while(count[skill_val] > 0){
                int complement = target - skill_val;

                // Check if complement exists
                if(count.find(complement) == count.end() || count[complement] <= 0){
                    return -1; // Invalid pairing
                }

                // If the skill and its complement are the same, ensure there are at least two
                if(skill_val == complement && count[skill_val] < 2){
                    return -1;
                }

                count[skill_val]--;
                count[complement]--;

                result += (long long)skill_val * (long long)complement;
            }
        }
        return result;
    }
};
```

## Permutation in String
[LeetCode](https://leetcode.com/problems/permutation-in-string/)

> **Problem:** Return `true` if `s2` contains a permutation of `s1` as a substring.

```cpp
class Solution {
public:
   bool checkInclusion(string s1, string s2) {
       if(s1.length() > s2.length()){
           return false;
       }

       vector<int> s1Arr(26, 0);
       vector<int> windowArr(26, 0);
       for(int i = 0; i < s1.length(); i++){
           s1Arr[s1[i] - 'a']++;
           windowArr[s2[i]-'a']++;
       }

       if (matches(s1Arr, windowArr))
           return true;

       for(int i = s1.length(); i < s2.length(); ++i){
           windowArr[s2[i]-'a']++;
           windowArr[s2[i-s1.length()]-'a']--;
           if (matches(s1Arr, windowArr))
               return true;
       }
       return false;
   }

   bool matches(vector<int>& s1Arr, vector<int>& s2Arr){
       for(int i = 0; i < 26; i++){
           if(s1Arr[i] != s2Arr[i]){
               return false;
           }
       }
       return true;
   }
};
```

- **Frequency arrays:** two size-26 arrays hold letter counts for `s1` and for the current window of `s2`.
- **First window:** fill the window with the first `len(s1)` characters and compare.
- **Sliding:** for each new character, increment its count and decrement the count of the character leaving (`s2[i - s1.length()]`), then compare again.
- **`matches`** returns true only if all 26 counts are equal. If no window matches, return `false`.

## Sentence Similarity III
[LeetCode](https://leetcode.com/problems/sentence-similarity-iii/)

> **Problem:** Two sentences are similar if you can insert one (possibly empty) sentence into one of them to get the other. Return whether they are similar.

Note: split sentences into words with `stringstream` in a `while` loop, as below.

```cpp
class Solution {
public:
    bool areSentencesSimilar(string sentence1, string sentence2) {
        stringstream ss1(sentence1), ss2(sentence2);

        string word;
        vector<string> s1words, s2words;
        while(ss1 >> word) s1words.push_back(word);
        while(ss2 >> word) s2words.push_back(word);

        int start = 0, ends1 = s1words.size() - 1;
        int ends2 = s2words.size() - 1;

        if(s1words.size() > s2words.size()){
            return areSentencesSimilar(sentence2, sentence1);
        }

        while(start < s1words.size() && s1words[start] == s2words[start]){
            ++start;
        }

        while(ends1 >= 0 && s1words[ends1] == s2words[ends2]){
            --ends1;
            --ends2;
        }
        return ends1 < start;
    }
};
```

## Lexicographical Numbers
[LeetCode](https://leetcode.com/problems/lexicographical-numbers/)

> **Problem:** Return the numbers `1..n` in lexicographical order, in O(n) time and O(1) extra space.

### Recursive

```cpp
class Solution {
public:
    vector<int> lexicalOrder(int n) {
        vector<int> ans;
        for(int start = 1; start <= 9; start++){
            dfs(start, n, ans);
        }
        return ans;
    }

    void dfs(int curr, int limit, vector<int>& res){
        if(curr > limit) return;
        res.push_back(curr);

        for(int i = 0; i < 10; i++){
            int next = 10*curr + i;
            if(next <= limit){
                dfs(next, limit, res);
            }
            else{
                break;
            }
        }
    }
};
```

### Iterative — O(n) time, O(1) space

```cpp
class Solution {
public:
    vector<int> lexicalOrder(int n) {
        vector<int> ans;
        int curr = 1;
        for(int i = 0; i < n; i++){
            ans.push_back(curr);

            if(curr * 10 <= n) curr *= 10;
            else{
                while(curr % 10 == 9 || curr >= n){
                    curr /= 10;
                }
                curr++;
            }
        }
        return ans;
    }
};
```

## Maximum Width Ramp
[LeetCode](https://leetcode.com/problems/maximum-width-ramp/)

> **Problem:** A ramp is a pair `i < j` with `nums[i] ≤ nums[j]`, and its width is `j - i`. Return the maximum ramp width (0 if there's none).

Monotonic decreasing stack of candidate left indices, then scan from the right.

```cpp
class Solution {
public:
   int maxWidthRamp(vector<int>& nums) {
       int n = nums.size();

       stack<int> st;
       for(int i = 0 ; i < n; i++){
           if(st.empty() || nums[st.top()] > nums[i]){
               st.push(i);
           }
       }

       int width = 0;

       for(int j = n-1; j >= 0; j--){
           while(!st.empty() && nums[st.top()] <= nums[j]){
               width = max(width, j-st.top());
               st.pop();
           }
       }
       return width;
   }
};
```

## The Number of the Smallest Unoccupied Chair
[LeetCode](https://leetcode.com/problems/the-number-of-the-smallest-unoccupied-chair/)

> **Problem:** Friends arrive and leave at distinct times, and each takes the lowest-numbered free chair on arrival. Return the chair `targetFriend` sits on.

Data structures: two heaps and sorting (practice 2–3 problems of this type). Read the editorial thoroughly.

```cpp
class Solution {
public:
   int smallestChair(vector<vector<int>>& times, int targetFriend) {
       int n = times.size();

       vector<pair<int, int>> events;

       for(int i =0; i < n; i++){
           events.push_back({times[i][0], i});
           events.push_back({times[i][1], ~i});
       }

       sort(events.begin(), events.end());

       priority_queue<int, vector<int>, greater<int>>
           availableChairs;  // Min-heap for available chairs
       priority_queue<pair<int, int>, vector<pair<int, int>>,
                      greater<pair<int, int>>>
           occupiedChairs;  // Min-heap to track when chairs will be vacated

       for (int i = 0; i < n; i++)
           availableChairs.push(i);  // Initially all chairs are free

       for(auto& event: events){
           int time = event.first;
           int friendIndex = event.second;

           while(!occupiedChairs.empty() &&
               occupiedChairs.top().first <= time){
               availableChairs.push(occupiedChairs.top().second);
               occupiedChairs.pop();
           }

           if(friendIndex >= 0){
               int chair = availableChairs.top();
               availableChairs.pop();

               if(friendIndex == targetFriend) return chair;

               occupiedChairs.push(
                   {times[friendIndex][1], chair}
               );
           }
       }
       return -1;
   }
};
```

### Algorithm

- Build `events`: arrivals as `{arrival time, friend index}` and leaves as `{leave time, ~friend index}` (bitwise NOT marks a leave). Sort by time.
- `availableChairs` is a min-heap of free chair indices (initially `0..n-1`). `occupiedChairs` is a min-heap of `{leave time, chair}`.
- For each event, first free every chair whose leave time is `<=` the current time.
- On an arrival, take the smallest free chair. If this is `targetFriend`, return the chair; otherwise push `{leave time, chair}` into `occupiedChairs`.

## Divide Intervals Into Minimum Number of Groups
[LeetCode](https://leetcode.com/problems/divide-intervals-into-minimum-number-of-groups/)

> **Problem:** Split the inclusive intervals into groups so that no two intervals in a group intersect. Return the minimum number of groups.

Answer = maximum number of concurrently open intervals (line sweep).

```cpp
class Solution {
public:
    int minGroups(vector<vector<int>>& intervals) {
        vector<pair<int, int>> intervalWithEnd;

        for(vector<int> interval: intervals){
            intervalWithEnd.push_back({interval[0], 1});
            intervalWithEnd.push_back({interval[1]+1, -1});
        }

        sort(intervalWithEnd.begin(), intervalWithEnd.end());

        int concurrentIntervals = 0, maxInterval = 0;

        for(auto& interval: intervalWithEnd){
            concurrentIntervals += interval.second;
            maxInterval = max(maxInterval, concurrentIntervals);
        }
        return maxInterval;
    }
};
```

## Smallest Range Covering Elements from K Lists
[LeetCode](https://leetcode.com/problems/smallest-range-covering-elements-from-k-lists/)

> **Problem:** Given `k` sorted lists, find the smallest range `[a, b]` that contains at least one number from each list.

```cpp
typedef pair<int, pair<int, int>> p;
class Solution {
public:
    vector<int> smallestRange(vector<vector<int>>& nums) {
        priority_queue<p, vector<p>, greater<p>> pq;

        int maxVal = INT_MIN, rangeStart = 0, rangeEnd = INT_MAX;

        for(int i = 0; i < nums.size(); i++){
            pq.push({nums[i][0], {i, 0}});
            maxVal = max(maxVal, nums[i][0]);
        }

        while(pq.size() == nums.size()){
            auto [minVal, indices] = pq.top();
            pq.pop();

            int row = indices.first, col = indices.second;
            // if the range is less than current range then update it
            if(maxVal - minVal < rangeEnd - rangeStart){
                rangeStart = minVal;
                rangeEnd = maxVal;
            }

            if(col+1 < nums[row].size()){
                int nextVal = nums[row][col+1]; // proceed to the next element
                pq.push({nextVal, {row, col+1}});
                maxVal = max(maxVal, nextVal);
            }
        }
        return {rangeStart, rangeEnd};
    }
};
```

## Longest Happy String
[LeetCode](https://leetcode.com/problems/longest-happy-string/)

> **Problem:** Build the longest string using at most `a` 'a's, `b` 'b's and `c` 'c's, with no three identical letters in a row.

Max-heap by remaining count. If the top character would make three in a row, use the second one instead.

```cpp
class Solution {
public:
    string longestDiverseString(int a, int b, int c) {
        priority_queue<pair<int, char>> pq;

        if(a > 0) pq.push({a, 'a'});
        if(b > 0) pq.push({b, 'b'});
        if(c > 0) pq.push({c, 'c'});

        string ans = "";

        while(!pq.empty()){
            pair<int, char> p = pq.top();
            pq.pop();

            int count = p.first;
            char c = p.second;

            if(ans.length() >= 2 && ans[ans.length()-1] == p.second && ans[ans.length()-2] == p.second){
                if(pq.empty()){
                    break; // no second char in the heap
                }

                auto temp = pq.top();
                pq.pop();
                ans += temp.second;
                if(temp.first-1 > 0){
                    temp.first--;
                    pq.push({temp.first, temp.second});
                }
            }
            else{
                count--;
                ans += c;
            }

            if(count > 0){
                pq.push({count, c});
            }
        }
        return ans;
    }
};
```

## Maximum Swap
[LeetCode](https://leetcode.com/problems/maximum-swap/)

> **Problem:** Swap two digits at most once to get the largest possible number. Return it.

Record the last index of each digit; for each position from the left, swap with the largest later digit that is bigger.

```cpp
class Solution {
public:
    int maximumSwap(int num) {
        // Convert the number to a vector of digits in the correct order
        vector<int> digits;
        int temp = num;
        if (temp == 0) {
            digits.push_back(0);
        }
        while (temp > 0) {
            digits.push_back(temp % 10);
            temp /= 10;
        }
        reverse(digits.begin(), digits.end());

        unordered_map<int, int> last;
        for (int i = 0; i < digits.size(); i++) {
            last[digits[i]] = i;
        }

        for (int i = 0; i < digits.size(); i++) {
            for (int d = 9; d > digits[i]; d--) {
                if (last.find(d) != last.end() && last[d] > i) {
                    swap(digits[i], digits[last[d]]);
                    int result = 0;
                    for (auto digit : digits) {
                        result = result * 10 + digit;
                    }
                    return result;
                }
            }
        }
        return num;
    }
};
```

## Count Number of Maximum Bitwise-OR Subsets
[LeetCode](https://leetcode.com/problems/count-number-of-maximum-bitwise-or-subsets/)

> **Problem:** Find the maximum possible bitwise OR of a subset, and return the number of non-empty subsets that reach it.

The max OR is the OR of all elements; count subsets reaching it with take/skip recursion.

```cpp
class Solution {
public:
    int countMaxOrSubsets(vector<int>& nums) {
        int n = nums.size();
        int max_or = 0;
        for(int i = 0; i < nums.size(); i++){
            max_or |= nums[i];
        }
        return dfs(0, 0, max_or, n, nums);
    }

    int dfs(int i, int cur_or, int max_or, int n, vector<int>& nums){
        if(i == n){
            if(cur_or == max_or){
                return 1;
            }
            else return 0;
        }
        else{
            return dfs(i+1, cur_or, max_or, n, nums) + dfs(i+1, cur_or | nums[i], max_or, n, nums);
        }
    }
};
```

## Parsing a Boolean Expression
[LeetCode](https://leetcode.com/problems/parsing-a-boolean-expression/description)

> **Problem:** Evaluate an expression made of `t`, `f`, `!(…)`, `&(…, …)` and `|(…, …)`.

Push characters onto a stack; on `)`, pop values back to `(`, pop the operator, evaluate, push the result. Time O(N).

```cpp
class Solution {
public:
    bool parseBoolExpr(string expression) {
        stack<char> st;

        for(char c: expression){
            if(c == ')'){ // initiate processing the sub expression
                vector<char> values;

                while(st.top() != '('){
                    values.push_back(st.top());
                    st.pop();
                }

                st.pop(); // remove the (
                char op = st.top();
                st.pop(); // remove the operator

                char result = evaluate(op, values);
                st.push(result);
            }
            else if(c != ','){
                st.push(c);
            }
        }
        return st.top() == 't';
    }

    char evaluate(char op, vector<char>& values){
        if(op == '!'){ // takes a single value and negates it
            return values[0] == 't' ? 'f' : 't';
        }
        if(op == '&'){
            for(char c : values){
                if(c == 'f'){ // if any one value is false return false
                    return 'f';
                }
            }
            return 't';
        }
        if(op == '|'){
            for(char c : values){
                if(c == 't'){ // if any one value is true return true
                    return 't';
                }
            }
            return 'f';
        }
        return 'f';
    }
};
```

## Remove Sub-Folders from the Filesystem
[LeetCode](https://leetcode.com/problems/remove-sub-folders-from-the-filesystem)

> **Problem:** Given a list of folder paths, remove every folder that is a sub-folder of another one, and return the rest.

Solved with a Trie (a little hard to code in an interview/contest).

```cpp
class Solution {
private:
    struct TrieNode{
        bool isEndOfFolder;
        unordered_map<string, TrieNode*> children;
        TrieNode(): isEndOfFolder(false){}
    };

    TrieNode* root = new TrieNode();
public:
    vector<string> removeSubfolders(vector<string>& folder) {

        for(string& path: folder){
            TrieNode* currentNode = root;
            istringstream iss(path);
            string folderName;

            while(getline(iss, folderName, '/')){
                if(folderName.empty()){
                    continue;
                }
                if(currentNode->children.find(folderName) == currentNode->children.end()){
                    currentNode->children[folderName] = new TrieNode();
                }
                currentNode = currentNode->children[folderName];
            }
            currentNode->isEndOfFolder = true;
        }

        vector<string> result;
        for(string& path: folder){
            TrieNode* currentNode = root;
            istringstream iss(path);
            string folderName;
            bool isSubFolder = false;
            while(getline(iss, folderName, '/')){
                if (folderName.empty()) continue;
                TrieNode* nextNode = currentNode->children[folderName];
                // rdbuf()->in_avail() reflects the remaining unread characters after each getline call.
                if(nextNode->isEndOfFolder && iss.rdbuf()->in_avail() != 0){
                    isSubFolder = true;
                    break;
                }
                currentNode = nextNode;
            }
            if(!isSubFolder){
                result.push_back(path);
            }
        }
        return result;
    }
};
```

## Find if Array Can Be Sorted
[LeetCode](https://leetcode.com/problems/find-if-array-can-be-sorted/)

> **Problem:** You may swap adjacent elements that have the same number of set bits. Return whether the array can be sorted.

Count set bits. Each run of equal popcount is a segment; the array is sortable only if every segment's min is at least the previous segment's max.

```cpp
class Solution {
public:
    bool canSortArray(vector<int>& nums) {
        int numOfSetBits = __builtin_popcount(nums[0]);
        int maxOfSegment = nums[0];
        int minOfSegment = nums[0];

        int maxOfPrevSegment = INT_MIN;

        for (int i = 1; i < nums.size(); i++) {
            if (__builtin_popcount(nums[i]) == numOfSetBits) {
                maxOfSegment = max(nums[i], maxOfSegment);
                minOfSegment = min(nums[i], minOfSegment);
            } else {
                if (minOfSegment < maxOfPrevSegment)
                    return false;

                maxOfPrevSegment = maxOfSegment;
                maxOfSegment = nums[i];
                minOfSegment = nums[i];
                numOfSetBits = __builtin_popcount(nums[i]);
            }
        }

        if (minOfSegment < maxOfPrevSegment)
            return false;
        return true;
    }
};
```

## Rotate String
[LeetCode editorial](https://leetcode.com/problems/rotate-string/editorial/) — KMP algorithm.

> **Problem:** Return `true` if `s` can become `goal` after some number of left rotations (shifts).

No code recorded in the notes.

## Best Sightseeing Pair
[LeetCode](https://leetcode.com/problems/best-sightseeing-pair/)

> **Problem:** The score of a pair `i < j` is `values[i] + values[j] + i - j`. Return the maximum score.

O(n): track the best `values[i] + i` seen so far; the score at `j` is that best plus `values[j] - j`.

```cpp
class Solution {
public:
    int maxScoreSightseeingPair(vector<int>& values) {
        int n = values.size();

        int maxScore = 0;
        int max_i = values[0] + 0;

        for(int j = 1; j < n; j++){
            maxScore = max(maxScore, max_i + values[j] - j);
            max_i = max(max_i, values[j] + j);
        }
        return maxScore;
    }
};
```
