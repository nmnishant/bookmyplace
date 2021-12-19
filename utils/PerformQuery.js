class PerformQuery {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  filter() {
    let queryObj = { ...this.queryStr };
    const excludeArr = ['page', 'limit', 'sort', 'fields'];
    excludeArr.forEach((elem) => delete queryObj[elem]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|ne)\b/g,
      (word) => `$${word}`
    ); // b - to match only exact words, g - to replace all not just first
    queryObj = JSON.parse(queryStr);

    this.query = this.query.find(queryObj);
    return this;
  }

  sort() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryStr.fields) {
      const selectFields = this.queryStr.fields.split(',').join(' ');
      this.query = this.query.select(selectFields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = this.queryStr.page * 1 || 1;
    this.queryStr.limit *= 1;
    const limit =
      (this.queryStr.limit && this.queryStr.limit > 100
        ? 100
        : this.queryStr.limit) || 20;
    this.query = this.query.skip(page).limit(limit);
    return this;
  }
}

module.exports = PerformQuery;
