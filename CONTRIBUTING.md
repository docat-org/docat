# Contributing to docat

Thanks for contributing to docat!
In order to keep the quality of the source-code high,
please follow those rules when submitting a change.

If you just want to fix a bug or make a small improvement
feel free to just send a pull request.

Please first discuss any big new features you wish to make via issue, email,
or any other method with the owners of this repository before making a change.

## Pull Request Process

Commits should be the following format

```
type(scope): commit title

commit body (if any)
this should document api breaks

fixes # (if any)
```

Type could be one of *feat, docs, fix, ...* and scope could be *docat, web, ...*
you don't have to provide a scope when the change is for the whole repository like README updates.

Execute linters by running `make lint` in the back-end or `yarn lint`.

A pull request will only be merged when the pipeline runs through.
