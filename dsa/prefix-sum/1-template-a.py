# Template A - Find the range sum of sub array


def prefixSum(nums):
    n = len(nums)
    prefix_sum = [0] * (n + 1)
    prefix_sum[0] = 1
    for i in range(n):
        prefix_sum[i + 1] = prefix_sum[i] + nums[i]

    return prefix_sum


def rangeSum(prefix, left, right):
    return prefix[right + 1] - prefix[left]


if __name__ == "__main__":
    nums = [3, 1, 4, 1, 5]
    prefix = prefixSum(nums)
    sum = rangeSum(prefix, 1, 3)
    print(sum)
