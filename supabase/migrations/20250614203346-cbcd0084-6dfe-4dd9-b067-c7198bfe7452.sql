
-- Function to find or create a conversation between two users
CREATE OR REPLACE FUNCTION public.find_or_create_conversation(p_other_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_conversation_id uuid;
BEGIN
    -- Find an existing conversation with exactly these two participants by comparing sorted arrays of participant IDs.
    SELECT conversation_id INTO v_conversation_id
    FROM (
        SELECT
            cp.conversation_id,
            array_agg(cp.user_id ORDER BY cp.user_id) AS participants
        FROM conversation_participants AS cp
        GROUP BY cp.conversation_id
        HAVING count(cp.user_id) = 2
    ) AS convos
    WHERE convos.participants = ARRAY[LEAST(auth.uid(), p_other_user_id), GREATEST(auth.uid(), p_other_user_id)]
    LIMIT 1;

    -- If a conversation is found, return its ID
    IF v_conversation_id IS NOT NULL THEN
        RETURN v_conversation_id;
    END IF;

    -- If no conversation is found, create a new one
    INSERT INTO conversations DEFAULT VALUES RETURNING id INTO v_conversation_id;

    -- Add both users as participants to the new conversation
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES (v_conversation_id, auth.uid()), (v_conversation_id, p_other_user_id);

    RETURN v_conversation_id;
END;
$$;
