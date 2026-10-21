import {
  PRODUCT_ARTICLE_PREFIX,
  PRODUCT_BARCODE_PREFIX,
  PRODUCT_CODE_MAX,
  PRODUCT_CODE_MIN,
} from "@/constants/product/product.constants";

const issued = new Set<string>();

const generateUnique = (prefix: string) => {
  let code = "";

  do {
    const digits = Math.floor(
      PRODUCT_CODE_MIN + Math.random() * (PRODUCT_CODE_MAX - PRODUCT_CODE_MIN + 1),
    );
    code = `${prefix}${digits}`;
  } while (issued.has(code));

  issued.add(code);
  return code;
};

export const generateArticle = () => generateUnique(PRODUCT_ARTICLE_PREFIX);

export const generateBarcode = () => generateUnique(PRODUCT_BARCODE_PREFIX);

export const isGeneratedBarcode = (code: string) =>
  code.startsWith(PRODUCT_BARCODE_PREFIX);
