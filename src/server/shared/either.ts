export type Left<L> = {
    readonly type: "left";
    readonly value: L;
};

export type Right<R> = {
    readonly type: "right";
    readonly value: R;
};

export type Either<L, R> = Left<L> | Right<R>;

export const left = <L, R = never>(value: L): Either<L, R> => ({
    type: "left",
    value,
});

export const right = <R, L = never>(value: R): Either<L, R> => ({
    type: "right",
    value,
});

export const isLeft = <L, R>(either: Either<L, R>): either is Left<L> =>
    either.type === "left";
