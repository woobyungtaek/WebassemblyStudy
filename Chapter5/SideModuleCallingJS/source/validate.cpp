#include <emscripten.h>

#ifdef  __cplusplus
//컴파일러가 네임 맹글링을 하지 않는다.
extern "C"
{
#endif

#include "side_module_system_function.h"

	// 자바 스크립트 함수 선언
	extern void UpdateHostAboutError(const char* error_message);


	//Webassambly 함수 구현

	/// <summary>
	/// ValidateName, Category 함수에 전달된 값이 있는지 확인하는 값
	/// </summary>
	/// <param name="value"> 전달 된 값</param>
	/// <param name="error_message"> 검증 오류 시 반환할 메시지</param>
	/// <param name="return_error_message"> 검증 오류 시 오류 메시지를 담을 버퍼 </param>
	/// <returns></returns>
	int ValidateValueProvided(const char* value, const char* error_message)
	{
		if ((value == NULL) || (value[0] == '\0'))
		{
			UpdateHostAboutError(error_message);
			return 0; // 오류 없음
		}

		return 1;	// 오류 있음
	}

	/// <summary>
	/// 카테고리 Id가 올바른지 체크
	/// </summary>
	/// <param name="selected_category_id"></param>
	/// <param name="valid_category_ids"></param>
	/// <param name="array_length"></param>
	/// <returns></returns>
	int IsCategoryIdInArray(char* selected_category_id, int* valid_category_ids, int array_length)
	{
		int category_id = atoi(selected_category_id);

		for (int index = 0; index < array_length; index++)
		{
			if (valid_category_ids[index] == category_id) { return 1; }
		}

		return 0;
	}


	/// <summary>
	/// 상품명 검증
	/// </summary>
	/// <param name="name"></param>
	/// <param name="maximum_length"></param>
	/// <param name="return_error_message"></param>
	/// <returns></returns>

	int	EMSCRIPTEN_KEEPALIVE ValidateName(char* name, int maximum_length)
	{
		if (ValidateValueProvided(name, "The Product Name must be provided") == 0)
		{
			return 0;
		}

		if (strlen(name) > maximum_length)
		{
			UpdateHostAboutError("The Product Name is too long");
			return 0;
		}

		return 1;
	}

	int	EMSCRIPTEN_KEEPALIVE ValidateCategory(char* category_id, int* valid_category_ids, int array_length)
	{
		if (ValidateValueProvided(category_id, "A Product Category must be selected.") == 0)
		{
			return 0;
		}

		if ((valid_category_ids == NULL) || (array_length == 0))
		{
			UpdateHostAboutError("There are no Product Categories available.");
			return 0;
		}

		if (IsCategoryIdInArray(category_id, valid_category_ids, array_length) == 0)
		{
			UpdateHostAboutError("The selected Product Category is not valid.");
			return 0;
		}

		return 1;
	}

#ifdef __cplusplus
}
#endif //  __cplusplus

